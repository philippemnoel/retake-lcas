# Retake Surface

Surface is the Retake web app automates verified life cycle assessments (LCAs) at scale.

## Installation and Setup

### Linking to Vercel

This project's environment variables are stored in Vercel. First, [join our
Vercel team](https://vercel.com/teams/invite/vaPSVBBUASrYdI82gxPulovNoTfGVe1H). Next, install
the Vercel CLI by running `npm i -g vercel`. Then, run `vercel-link` and connect it to
the `surface-dev` project. Finally, pull the environment variables by running
`vercel env pull .env.local`. This will create a pre-populated `.env.local` file.

For local development, you will need to change the `AUTH0_BASE_URL` variable to
`http://localhost:3000` inside the `.env.local` file.

### Development Environment

To install Nodejs dependencies into a Docker volume that will be used by the application running
in the Docker Compose stack, run

```
docker compose run deps
```

If you want to run linters and formatters locally, you'll also have to
install these same dependencies with `yarn`. The reason why we have to
install dependencies twice is that macOS Docker actually runs containers
inside a Linux virtual machine. macOS users may encounter errors if they try
to mount their macOS Nodejs dependencies to the container running the
development application.

And that's it! You're done setting up your development environment.

## Developing locally

After running `docker compose run deps` you're good to go! Bring up the
development application with `docker compose up [-d]`. You can use it by
visiting `http://localhost:3000` in your web browser. If it's working
properly, you won't be able to log in to the development Enterprise Dashboard
unless you are an administrator of an organization on our Auth0 tenant. Visit
the Auth0 dashboard to add yourself or ask someone to do it for you.

If you are connecting this application to a local server, you'll need to use `ngrok`.
Alternatively, you can run `yarn run dev` instead of `docker compose up` as a workaround.

If you want to view the browser logs while detached from Docker, you can `docker 
logs --follow surface-app-1`.

Before submitting any changes you make, ensure your code is properly formatted
and devoid of lint by running `yarn run lint [-- [--help]]` and
`yarn run format [-- [--help]]`.

### Development Tips

If you make changes to the install scripts or the `core` repo, make sure to
run `docker system prune`. If you don't, running `docker compose up` will use
old cached images.

### Building and Deploying

The dashboard is deployed to Vercel. The `dev` branch is deployed [here](https://dev.retake.earth) and the `prod`
branch is deployed [here](https://app.retake.earth). Deploys happen automatically on merges into these branches.
