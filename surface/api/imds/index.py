import copy
from io import BytesIO
import os
from flask import Flask, request
import pdfplumber
import pandas as pd
import psycopg2
import requests
from psycopg2.extras import execute_values
from treelib import Node, Tree

app = Flask(__name__)


def build_tree(dataframe):
    """
    Builds a tree from a pandas dataframe. The treelib module is used to
    represent the tree data structure. The function uses a combination of
    loops, stacks and conditions to try and parse the file to a tree while
    maintaining the hierarchy as seen in the IMDS document.

    Args:
    dataframe:
        A pandas dataframe which includes all rows and columns in the IMDS document.
    Returns:
        tree:
            The tree which was built from the dataframe.
    """

    # Initialize tree
    tree = Tree()

    # Create the root node
    root = Node(data=dataframe.iloc[0])
    tree.add_node(root)

    # Initialize a stack to keep track of parent nodes
    stack = [root]

    # Loop through the data list, starting from the second element
    for _, row in dataframe.iloc[1:].iterrows():
        if row["Description"] is None:
            continue

        node = Node(data=row)

        # If the current node's level is greater than the previous node's level,
        # add the current node as a child of the previous node
        if node.data["Level"] > stack[-1].data["Level"]:
            tree.add_node(node, parent=stack[-1])
            stack.append(node)
        else:
            # Pop nodes from the stack until we find a node whose level is
            # less than the current node's level, and add the current node as
            # a child of that node
            while len(stack) > 1 and node.data["Level"] <= stack[-1].data["Level"]:
                stack.pop()

            tree.add_node(node, parent=stack[-1])
            stack.append(node)

    return tree


def infer_weight(obj, parent):
    """
    This function tries to infer the weight of the material
    from the immediate parent percentage.

    Args:
    obj:
        The parsed dictionary, which is in process of being standardized. The function
        gets the weights and percentages from this dictionary.
    parent:
        The parent node.

    Returns:
    inferred_weight:
        The weight that was inferred using the methods described.
    None:
        When the weight is not found.
    """
    if "weight" in obj.keys() and obj["weight"] != "":
        return float(obj["weight"])
    if "percent" in obj.keys() and obj["percent"] != "":
        # If we are given a percentage, infer from the weight of
        # the parent
        if parent is not None and "weight" in parent.keys() and parent["weight"] != "":
            return float(parent["weight"]) * float(obj["percent"]) / 100

        # Got a weight percentage but no valid parent weight
        return None

    # No weight or percentage present in row
    return None


def infer_weight_from_parents(tree, node, obj):
    """
    This function tries to infer the weight of the material
    from its ancestors. This function is called after no weight
    could be inferred from the immediate parents. It then traverses
    the ancestors of the material until it finds a weight in grams
    and uses the parents percentage to infer the actual weight.
    In case no weight could be inferred, the function uses a reasonable default.

    Args:
    tree:
        A tree representation of the IMDS document.
    node:
        The raw node which will be used to traverse the ancestors in the tree.
    obj:
        The parsed dictionary, which is in process of being standardized. The function
        gets the weights and percentages from this dictionary.

    Returns:
    inferred_weight:
        The weight that was inferred using the methods described.
    default_weight_grams_if_not_found:
        If no weight is found, return a default value.
    """

    default_weight_grams_if_not_found = 100

    ancestor_id = tree.ancestor(node.identifier)
    current_ancestor = tree.get_node(ancestor_id)
    current_node = node
    parent_percent = None
    while current_node is not None:
        if parent_percent is not None and current_ancestor.data["Weight"] != "":
            # Parent weight percent has been found, use to compute the
            # weight
            inferred_parent_weight = (
                float(current_ancestor.data["Weight"]) * float(parent_percent) / 100
            )
            original_node_weight = (
                float(inferred_parent_weight) * float(obj["percent"]) / 100
            )
            return original_node_weight
        if (
            current_ancestor is not None
            and current_ancestor.data["Weight"] != ""
            and "percent" in obj.keys()
            and obj["percent"] != ""
        ):
            # Found a weight in grams in the node's parent, use it to
            # compute the node's weight
            return float(current_ancestor.data["Weight"]) * float(obj["percent"]) / 100
        if (
            current_ancestor is not None
            and current_ancestor.data["Percent"] != ""
            and "percent" in obj.keys()
            and obj["percent"] != ""
        ):
            # Found a weight percent in the node's parent, store for
            # later computations
            parent_percent = current_ancestor.data["Percent"]

        current_node = current_ancestor

        if current_node is not None:
            ancestor_id = tree.ancestor(current_node.identifier)
            current_ancestor = tree.get_node(ancestor_id)

    # If no weight could be found or inferred, return a default number
    return default_weight_grams_if_not_found


def get_lca_material_composition(tree, org_id, lca_id):
    """
    Traverses the tree respresentation of the IMDS file,
    and extracts each part/material (represented by each node).
    This functions tries to standardize and fill out any empty
    fields with set defaults, so they can be inserted to the
    database.

    Args:
    tree:
        A tree representation of the IMDS file.
    org_id:
        The unique identifier of the organization which the IMDS
        document belongs to.
    lca_id:
        The unique identifier of the LCA which the IMDS document
        belongs to.
    """

    # Try to standardized to match the database schema
    parsed = []

    for node in tree.all_nodes_itr():
        obj = node.data.to_dict()
        parent_id = tree.ancestor(node.identifier)

        if parent_id is not None and parent_id != "":
            parent = tree.get_node(parent_id).data.to_dict()

            # Edit the key names to lowercase and snake case
            parent = dict((k.lower(), v) for k, v in parent.items())
            parent = dict((k.replace(" ", "_"), v) for k, v in parent.items())
        else:
            parent = None

        # Edit the key names to lowercase and snake case
        obj = dict((k.lower(), v) for k, v in obj.items())
        obj = dict((k.replace(" ", "_"), v) for k, v in obj.items())

        # Skip parts with "system" as a part_id because they are
        # explicitly marked as "Not to declare"
        if obj["part_id"] == "system":
            continue

        # Fallback to imds id if the part id is empty
        if (
            ("part_id" not in obj.keys() or obj["part_id"] == "")
            and "imds_id" in obj.keys()
            and obj["imds_id"] != ""
        ):
            obj["part_id"] = obj["imds_id"]

        # If part id is still empty, assign it a part id
        if obj["part_id"] == "" or obj["part_id"] is None:
            obj["part_id"] = obj["description"]

        obj["org_id"] = org_id
        obj["lca_id"] = lca_id
        obj["level"] = int(obj["level"] or 0)
        obj["weight_grams"] = infer_weight(obj, parent)
        obj["customer_part_id"] = obj["part_id"]
        obj["retake_part_id"] = obj["customer_part_id"] + "-" + org_id
        obj["part_description"] = obj["description"]

        # If we fail to infer the weight from the grams, try to infer
        # from the weight of the nearest parent with weight instead of
        # percentage
        if obj["weight_grams"] is None:
            weight = infer_weight_from_parents(tree, node, obj)

            if weight is not None:
                # Update the node so children of it can use the computed
                # weight
                node.data["Weight"] = weight
                obj["weight_grams"] = weight

        # Remove columns that are not used in the db
        obj.pop("weight", None)
        obj.pop("percent", None)
        obj.pop("imds_id", None)
        obj.pop("part_id", None)
        obj.pop("description", None)

        # Use the node id as an identifier, and include the parent
        # in each object.
        obj["id"] = node.identifier
        obj["parent_id"] = parent_id
        parsed.append(obj)
    return parsed


def get_lca_parts(materials):
    """
    Extracts parts from a list of material composition,
    which is extracted from the IMDS file. The materials
    argument is a list which contains both materials and parts,
    but this function extracts the unique parts only.

    Args:
    materials:
        The full processed data from the document, which includes
        materials and parts.
    """
    lca_parts = []
    unique_materials = list({v["retake_part_id"]: v for v in materials}.values())

    for part in unique_materials:
        # TODO: how to get these values?
        part["origin"] = None

        part.pop("supplier", None)
        part.pop("parent_id", None)
        part.pop("level", None)
        part.pop("weight_grams", None)
        part.pop("lca_id", None)
        part.pop("id", None)

        lca_parts.append(part)

    return lca_parts


def load_pages(file):
    """
    A generator function which lazy-loads each page from
    the pdf file and yields a pandas dataframe.

    Args:
    file:
        The binary pdf file.
    Returns:
    df_page:
        Yields a dataframe for each page.
    """
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            data = page.extract_table()
            page.flush_cache()
            if data is not None:
                data_rows = data[1:]
                df_page = pd.DataFrame(
                    data_rows,
                    columns=[
                        "Level",
                        "Description",
                        "Part ID",
                        "IMDS ID",
                        "Quantity",
                        "Weight",
                        "Percent",
                        "Percent Range",
                        "N/A",
                        "N/A",
                    ],
                )
                yield df_page


def insert_to_db(lca_parts, material_composition):
    """
    Insert the parts and materials found in the IMDS file.

    Args:
    lca_parts:
        A list of parts for an LCA, as found and processed from
        the original IMDS document.
    material_composition:
        A list of materials which make each LCA part, as found
        and processed from the original IMDS document.
    """
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cursor = conn.cursor()

    # Insert into parts table
    columns = lca_parts[0].keys()
    excluded_columns = ["EXCLUDED." + col for col in columns]

    query = f"""
    INSERT INTO parts ({",".join(columns)}) 
    VALUES %s 
    ON CONFLICT (org_id, customer_part_id) 
    DO UPDATE SET({",".join(columns)}) = ({",".join(excluded_columns)})
    """

    values = [list(part.values()) for part in lca_parts]
    execute_values(cursor, query, values)

    # Insert into LCA results table
    columns = ["material_composition_id", "retake_part_id", "customer_part_id", "part_description", "org_id", "weight_grams", "lca_id"]

    query = f"""
    INSERT INTO cml_total_results ({','.join(columns)}) 
    VALUES %s
    """

    values = [
        tuple(part['id'] if column == "material_composition_id" else part.get(column, None) for column in columns)
        for part in material_composition
        if part.get('level') == 1
    ]

    execute_values(cursor, query, values)

    # Finally, remove 'description' from the materials composition list
    keys_to_delete = ["part_description", "customer_part_id"]
    for items in material_composition:
        for del_key in keys_to_delete:
            if del_key in items:
                del items[del_key]

    # Insert into materials_composition table
    columns = material_composition[0].keys()

    query = f"""
    INSERT INTO material_composition ({','.join(columns)}) 
    VALUES %s
    """
    values = [list(material.values()) for material in material_composition]
    execute_values(cursor, query, values)

    conn.commit()
    conn.close()


def compute_emissions_factors(lca_parts):
    """
    Call the emissions factors endpoint to find an emissions
    factor for each inserted part.

    Args:
    lca_parts:
        A list of parts, they should already exist in the
        database or the endpoint will reject the request.
    """
    try:
        timeout_seconds = 60
        part_ids = [part["retake_part_id"] for part in lca_parts]
        resp = requests.post(
            os.environ["EMISSIONS_ENDPOINT"],
            headers={"x-api-key": os.environ["EMISSIONS_ENDPOINT_API_KEY"]},
            json={"part_ids": part_ids},
            timeout=timeout_seconds,
        )
        print(f"response code: {resp.status_code}")
        print(resp.content)
        if resp.status_code != 200 and resp.status_code != 202:
            raise requests.exceptions.RequestException(resp.status_code)
    except requests.exceptions.RequestException as error:
        raise error


@app.route("/", methods=["POST"])
def imds_parser():
    """Responds to an HTTP request using data from the request body parsed
    according to the "content-type" header.
    Args:
    lca_id: The LCA this document belongs to.
    file_url: The URL of the IMDS document to parse.
    """
    content_type = request.headers.get("content-type")

    if content_type != "application/json":
        raise ValueError(f"Unknown content type: {content_type}")

    request_json = request.get_json(silent=True)

    if not request_json or "org_id" not in request_json:
        raise ValueError("JSON is invalid, or missing an 'org_id' property")

    org_id = request_json["org_id"]

    if not request_json or "lca_id" not in request_json:
        raise ValueError("JSON is invalid, or missing an 'lca_id' property")

    lca_id = request_json["lca_id"]

    if not request_json or "file_url" not in request_json:
        raise ValueError("JSON is invalid, or missing a 'file_url' property")

    file_url = request_json["file_url"]

    timeout_seconds = 5
    response = requests.get(file_url, timeout=timeout_seconds)

    file = BytesIO(response.content)

    try:
        pdf_frames = load_pages(file)
    except pdfplumber.pdfminer.pdfparser.PDFSyntaxError:
        return ("Invalid PDF", 400)

    # Create an empty DataFrame to append to
    df_all = pd.DataFrame()

    # Lazy-load pdf, process page by page
    for df_page in pdf_frames:
        df_page = df_page[
            ["Level", "Description", "Part ID", "IMDS ID", "Weight", "Percent"]
        ]
        df_page = df_page[:-1]
        df_all = pd.concat([df_all, df_page], ignore_index=True)

    df_all = df_all[["Level", "Description", "Part ID", "IMDS ID", "Weight", "Percent"]]
    df_all = df_all[:-1]
    tree = build_tree(df_all)

    material_composition = get_lca_material_composition(tree, org_id, lca_id)
    # Copy the list since some keys need to be removed afterwards. Otherwise they will
    # be removed from the underlying list
    lca_parts = get_lca_parts(copy.deepcopy(material_composition))

    try:
        insert_to_db(lca_parts, material_composition)
    except Exception as error:
        print(error)
        return ("Failed to insert rows to database", 500)

    try:
        compute_emissions_factors(lca_parts)
    except requests.exceptions.RequestException as error:
        print(error)
        return (
            "Document processed successfully, but failed to compute emissions factors for inserted rows",
            202,
        )

    print("OK")
    return ("OK", 200)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
