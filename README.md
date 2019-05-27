Express playground
===

> A minimal Express project for experimenting and refining templates / deployment pipelines

Master branch
---

Master branch is reserved for ideal skeleton project

So keep large additions and experiments on separate descriptively named branches

Available commands
--- 

to see a list of available commands run:
```bash
npm run help
```

to see a list of available Make commands run:
```bash
make
```

Quick Start
---

run the following command to initialize project:
```bash
npm run init
```
then update your local ``.env`` as needed (eg. set ``AWS_PROFILE`` to the profile you want to use)

 1. ``npm i`` install NPM dependencies
 2. ``npm run init`` initialize the project (creates local env files)
 3. make sure you have setup a ``default`` AWS credential profile (in ``~/.aws/credentials``) or change the value of ``AWS_PROFILE`` in ``.env.local`` to whatever profile you would like to use
 4. ``npm run db:start`` start db
 5. ``npm run db:migrate`` run db migrations
 6. ``make psql F=".backups/data/seed.sql"`` seed ``dvdrentals`` database with sample data (optional)
 7. ``npm run start`` start Express

Testing
---

run all unit tests (optionally in watch mode):
```bash
npm run test
npm run test:watch
```

run all e2e tests (optionally in watch mode):
```bash
npm run test:e2e
npm run test:e2e:watch
```

generate test coverage report for unit tests (excludes handlers.js):
```bash
npm run test:unit:cov
```
this allows us to ensure that we are unit testing code and not relying on coverage provided by e2e tests

generate test coverage report for all tests:
```bash
test:cov
```

Deployment
---

set ``AWS_PROFILE`` in your local ``.env`` to the profile you want to use to run deployment.

then deploy using the following command:
```bash
npm run aws:deploy
```

and you can remove the deployment as follows (do this when you're done experimenting):
```bash
npm run aws:remove
```

Contributing
---

To contribute new features to the ideal skeleton project, submit a pull request to master branch.

Data
---

### seed dvd-rentals database

```bash
make pg-restore DB="dvdrentals" DIR="playground/data/dvdrentals"
```
NOTE: ``DIR`` must be the directory within the docker container (so use a volume to share any local files you want to target)
