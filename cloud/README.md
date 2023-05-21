# Overview

We use Supabase as a backend, which includes a Postgres database, serverless
functions, and a REST API.

# Setting up development for Supabase

The first step is installing the
[Supabase CLI](https://supabase.com/docs/guides/cli). Once you are done, follow
the steps of this
[guide](https://supabase.com/docs/guides/cli/local-development) for setting up
your local environment.

## Secrets

Create a file called `.env` in the root directory and paste the following
inside, making sure to replace variables where instructed in the comments:

```
# .env

# —————————————————————————————————
#      Development Variables
# —————————————————————————————————

# These are all generated via your ngrok instance or `supabase start`.
SURFACE_BASE_URL=retake-<your_name>-dev-surface.ngrok.io
LOCAL_SUPABASE_URL=retake-<your_name>-dev-edge.ngrok.io
ANON_KEY=fakefakefake

# —————————————————————————————————
#          Other Variables
# —————————————————————————————————

# Ask team for these other variables.
```

## Ngrok

For some reason, Supabase does not accept URLs that are not SSL-secured, which
means that we need to run everything through Ngrok. This also has the incidental
benefit of exposing these URLs to the public web, meaning we can receive things
like webhooks from Postmark.

To set this up, feel free to view https://ngrok.com/docs/getting-started/. Specifically:

1. Join our Ngrok organization and find your auth token within the UI.
2. Install ngrok locally via `brew`: `brew install --cask ngrok`.
3. Run `ngrok authtoken <your_authtoken>` to attach your CLI instance to the account you
   have within the Retake organization on ngrok.com.
4. View your ngrok configuration with your editor of choice, e.g. `code ~/.ngrok2/ngrok.yml`
   and edit it to include two tunnels to separate ports. One will be to the `surface` repo,
   the other will be to the local Supabase DB (`edge`).

```
# ~/.ngrok2/ngrok.yml
authtoken: fake
version: "2"
region: us
tunnels:
  surface:
    addr: 3000  # Switch to whatever localhost port your Surface repo is exposed on.
    proto: http
    hostname: retake-<your_name>-dev-surface.ngrok.io
  edge:
    addr: 54321  # Switch to whatever localhost port your Supabase HTTP url is exposed on.
    proto: http
    hostname: retake-<your_name>-dev-edge.ngrok.io
  background:
    addr: 9999
    proto: http
    hostname: retake-<your_name>-dev-background.ngrok.io
```

5. Run `ngrok start --all` to start both tunnels.

Congrats! Now you should have both your surface and cloud repos, once they run, accessible
to each other and the broader web.

## Database

### Pulling database schema

For pulling the database schema, use `supabase db dump -f schema.sql`

You can then import to your local database with
`psql postgresql://postgres:postgres@172.17.0.1:54322/postgres < schema.sql`.

Note: Sometimes the `172.17.0.1` address doesn't work, alternatively try using
`localhost`.

If you want to import data, you can make a backup of the database with
`supabase db dump --data-only -f data.sql` and import it with
`psql postgresql://postgres:postgres@172.17.0.1:54322/postgres < data.sql`

### Creating and deploying migrations to the database

To change database state on staging or production, we should be using migrations.
To generate a migration, you can edit your DB state within your local Supabase
instance (e.g. by visiting `localhost:54323`). Then, generate your migration by
running

```
supabase db diff -f <new_migration_name>
```

Once you generate the migration, check it to make sure it does what you want and
doesn't capture any extra changes.

To deploy changes to the staging or production DBs, use `supabase db push`. Be
careful, and make sure to check the diff beforehand with `supabase db diff`.

### Viewing your local Supabase DB

Viewing the database locally can be somewhat difficult. To do so, I installed Postico
and generated a new SUPERADMIN user via `psql` that I plugged in to Postico and
allowed me to view the local Supabase via a GUI.

```
psql postgresql://postgres:postgres@172.17.0.1:54322/postgres

> CREATE USER postico WITH SUPERUSER PASSWORD 'password';
> exit
```

Then, you can just plug in your user and password into Postico. Happy hacking!

## GCloud Functions

The more processing-heavy parts of the backend are deployed as serverless GCP functions. Follow the instructions to develop locally and deploy. 

### Preparation

Install the packages in the `requirements.txt` with `pip install -r requirements.txt`.

### Developing

Once you have all the packages installed, you can start the function locally by running:
```bash
python main.py
```

This will start a flask server you can use to develop locally. If you need to connect to the database, set the 
`DATABASE_URL` environment variable to the command:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres python main.py
```

### Deploying

The IMDS parser code is deployed as a container to GCP's Cloud Run, which takes care of
building and deploying from the Dockerfile.

For deploying the service, use the command:

```bash
gcloud run deploy imdsparser --region us-central1 --source .
```