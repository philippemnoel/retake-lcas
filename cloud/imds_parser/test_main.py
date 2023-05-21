from main import build_tree, infer_weight, infer_weight_from_parents
from treelib import Tree
import pandas as pd
import pytest
import functools


def test_build_tree():
    data = [
        [1, "Alarm Harness", "17284.000.000", "5319770 / 1", "7.8411", None],
        [2, "Switch F5T8", "50920.007.893", None, "0.3431", None],
        [3, "OP PLUN F4/F5", "OP PLUN F4/F5", None, "0.0113", None],
    ]
    input_df = pd.DataFrame(
        data,
        columns=["Level", "Description", "Part ID", "IMDS ID", "Weight", "Percent"],
    )
    expected = Tree()
    root = expected.create_node(data=input_df.iloc[0])
    node = expected.create_node(data=input_df.iloc[1], parent=root)
    expected.create_node(data=input_df.iloc[2], parent=node)

    out = build_tree(input_df)
    assert out.depth() == expected.depth()

    assert (
        functools.reduce(
            lambda x, y: x and y,
            map(
                lambda p, q: p.data.equals(q.data),
                expected.all_nodes_itr(),
                out.all_nodes_itr(),
            ),
            True,
        )
        is True
    )


@pytest.mark.parametrize(
    "test_input,parent,expected",
    [
        ({"weight": "100.5"}, {}, 100.5),
        ({"percent": "90"}, {"weight": 100.0}, 90),
        ({"percent": "90"}, {}, None),
        ({}, {}, None),
    ],
)
def test_infer_weight(test_input, parent, expected):
    assert infer_weight(test_input, parent) == expected


@pytest.mark.parametrize(
    "root_weight, root_percent, parent_weight, parent_percent, node_weight, node_percent, expected",
    [
        ("", "", "10", "", "", "90", 9.0),
        ("10", "", "", "80", "", "50", 4.0),
        ("", "", "", "", "", "50", 100.0),
    ],
)
def test_infer_weight_from_parents(
    root_weight,
    root_percent,
    parent_weight,
    parent_percent,
    node_weight,
    node_percent,
    expected,
):
    data = [
        [1, "Alarm Harness", "17284.000.000", "5319770 / 1", root_weight, root_percent],
        [2, "Switch F5T8", "50920.007.893", None, parent_weight, parent_percent],
        [3, "OP PLUN F4/F5", "OP PLUN F4/F5", None, node_weight, node_percent],
    ]
    input_df = pd.DataFrame(
        data,
        columns=["Level", "Description", "Part ID", "IMDS ID", "Weight", "Percent"],
    )

    tree = Tree()
    root = tree.create_node(data=input_df.iloc[0], parent=None)
    parent = tree.create_node(data=input_df.iloc[1], parent=root)
    node = tree.create_node(data=input_df.iloc[2], parent=parent)

    obj = node.data.to_dict()
    obj = dict((k.lower(), v) for k, v in obj.items())
    obj = dict((k.replace(" ", "_"), v) for k, v in obj.items())

    assert infer_weight_from_parents(tree, node, obj) == expected
