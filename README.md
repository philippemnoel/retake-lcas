# Retake Monorepo

This repository contains all the code necessary to run the Retake web app, excluding forked dependencies, following a monorepo structure.

## Repository Structure

The Retake monorepo contains several subprojects:

| Subrepository                    | Description                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| surface                          | Next.js web app                                                                         |
| cloud                            | Backend code outside Next.js, like Supabase migration files or Python servers           |
| flatfile                         | Flatfile sheet and workbook definitions using the Flatfile SDK (for in-app CSV upload)  |

For a more in-depth explanation of each subrepository, see that subrepository's README.

## Development 

### Setting up SSH

First, you will have to clone this repository. Make sure to clone over SSH and not HTTPS.

In case you don't have SSH set up, follow these steps:

1. Open your terminal and run

```
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. Copy the key to your clipboard by running

```
pbcopy < ~/.ssh/id_ed25519.pub
```

3. Go to your GitHub account settings, select "SSH and GPG keys", and click on
   "New SSH key". Paste the contents of your public key file into the "Key"
   field and give the key a name.

### Branch Conventions

- `prod` -- This branch is for Stable channel only, do not push to it.
- `staging` -- TBD, will be created in the future.
- `dev` -- This is our main development branch, and PRs should be made to this branch.
- All other branches are considered feature branches. They should be forked off of `dev` and PR-ed into `dev`.

### Commit Conventions

Clear commit logs are extremely important in a monorepo, due to the number of different active projects that share the git history. Like branch names, commit messages should be descriptive and contain enough context that they make sense _on their own_. Commit messages like "fix", "works", or "oops" can be annoyingly unhelpful. Even something as innocuous-sounding as "staging merge" can be confusing -- are we merging into `staging`, or merging `staging` into another branch? What other branch(es) are involved?

### PR Conventions

When opening a PR, please ensure that the PR title adheres to the format outlined [here](https://github.com/amannn/action-semantic-pull-request).

## Publishing

Both `dev` and `prod` get deployed automatically via GitHub Actions to our respective environments on every push to the respective branches.