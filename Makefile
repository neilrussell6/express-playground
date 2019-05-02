# -----------------------------------------------------------
# vars
# -----------------------------------------------------------

SHELL := /bin/bash
COMMA := ,

# envs
ENV := local
ENVS := local staging test
ENV_FILENAME := .env
ENV_FILENAME_SLS := env.yml
ENV_TARGET_FILENAME := .env.$(ENV)
ENV_TPL_FILENAME := .env.$(ENV).tpl
ENV_TARGET_DIFF := if [[ -f $(ENV_TARGET_FILENAME) ]]; then sh ./scripts/get-files-key-diff.sh $(ENV_TPL_FILENAME) $(ENV_TARGET_FILENAME); fi

# TODO: do these in a loop
ENV_LOCAL_TPL_DIFF := if [[ -f .env.local.tpl && -f .env.local ]]; then sh ./scripts/get-files-key-diff.sh .env.local .env.local.tpl; fi
ENV_DEV_TPL_DIFF := if [[ -f .env.dev.tpl && -f .env.dev ]]; then sh ./scripts/get-files-key-diff.sh .env.dev .env.dev.tpl; fi
ENV_STAGING_TPL_DIFF := if [[ -f .env.staging.tpl && -f .env.staging ]]; then sh ./scripts/get-files-key-diff.sh .env.staging .env.staging.tpl; fi
ENV_TEST_TPL_DIFF := if [[ -f .env.test.tpl && -f .env.test ]]; then sh ./scripts/get-files-key-diff.sh .env.test .env.test.tpl; fi

# docker
DOCKER_COMPOSE_FILENAME := docker-compose.yml
DOCKER_COMPOSE_TPL_FILENAME := docker-compose.yml.tpl

# postgres
POSTGRES_CONTAINER := postgres
POSTGRES_CONTAINER_UP_WAIT_TIME := 2
POSTGRES_CONTAINER_RUNNING := if [[ -f $(ENV_TARGET_FILENAME) && -n $$(docker-compose ps | grep '$(POSTGRES_CONTAINER)_[0-9+].*Up') ]]; then echo true; else echo false; fi

# backups
BACKUP_DIR := .backups/data
BACKUP_DB_FILE := $(BACKUP_DIR)/dump_`date +%Y-%m-%d"_"%H_%M_%S`.sql

# scripts
print_utils := ./scripts/print-utils.sh

# -----------------------------------------------------------
# includes
# -----------------------------------------------------------

# include env file and make print library
-include .env.$(ENV)

# -----------------------------------------------------------
# functions
# -----------------------------------------------------------

# -----------------------------
# print
# -----------------------------

define print
	@$(eval COLOR=$(or $(3),$(MAKE_THEME)))
	@$(eval MOD=$(or $(4),NORMAL))
    @echo $$(sh $(print_utils) $(1) $(2) $(COLOR) $(MOD))
endef

define printList
	@$(eval COLOR=$(or $(2),$(MAKE_THEME)))
	@$(eval MOD=$(or $(3),NORMAL))
    @sh $(print_utils) printList $(1) ";" $(COLOR) $(MOD)
endef

define printDefListItem
	@$(eval COLOR1=$(or $(3),$(MAKE_THEME)))
	@$(eval COLOR2=$(or $(4),$(3),LIGHTER_GREY))
	@$(eval PAD=$(or $(5),$(MAKE_PADDING)))
    @sh $(print_utils) printDefListItem $(1) $(2) $(COLOR1) $(COLOR2) $(PAD)
endef

# -----------------------------
# call API
# -----------------------------

# $(1): curl command part
# $(2): token
define _curl_api
	@$(call print,h2,"curl $(API_URL)$(1) -H \"Content-Type: application/json\" -H \"Authorization: <TOKEN>\"")
	@$(shell echo "curl $(API_URL)"$(1) "-H \"Content-Type: application/json\" -H \"Authorization: $(2)\"")
endef

# -----------------------------
# call API with auth
# -----------------------------

# if user provides a token arg then use that
ifneq ($(TOKEN),)
define _curl_api_with_auth
	@$(call print,h3,"using provided token ...")
	@$(call _curl_api,$(1),$(TOKEN))
endef
else

# if env has token correctly set
ifneq ($(AWS_COGNITO_ID_TOKEN),XXXXXXXXXXXX)
define _curl_api_with_auth
	@$(call print,h3,"no token provided so using env token ...")
	@$(call _curl_api,$(1),$(AWS_COGNITO_ID_TOKEN))
endef
else

# if env has email and password correctly set
ifneq ($(AWS_COGNITO_EMAIL),XXXXXXXXXXXX)
ifneq ($(AWS_COGNITO_PASSWORD),XXXXXXXXXXXX)
define _curl_api_with_auth
	@$(call print,h3,"no token provided and env token is not set so authenticating with email and password ...")
	@$(call _curl_api,$(1),$$(make _auth | jq .AuthenticationResult.IdToken))
endef
else

define _curl_api_with_auth
	@$(call print,h2,"please do one of the following:",LIGHTRED)
	@$(call print,h2," 1. provide token directly eg \`\`make $@ TOKEN=<YOUR TOKEN>\`\`",LIGHTRED)
	@$(call print,h2," 2. or set token env variable in $(ENV_TARGET_FILENAME):",LIGHTRED)
	@$(call printList,"AWS_COGNITO_ID_TOKEN",GOLD)
	@$(call print,h2," 3. or set credential env variables in $(ENV_TARGET_FILENAME):",LIGHTRED)
	@$(call printList,"AWS_COGNITO_EMAIL;AWS_COGNITO_PASSWORD",GOLD)
	@echo ""
endef
endif
endif
endif
endif

# -----------------------------------------------------------
# help
# -----------------------------------------------------------

help:
	@$(call print,h1,"AVAILABLE OPTIONS")
	@$(call printDefListItem," - init","copy local files")
	@echo ""
	@$(call print,h3,"ENV")
	@$(call printDefListItem," - init-envs","creates all local env files")
	@$(call printDefListItem," - create-env","generates .env and env.yml files for target environment")
	@echo ""
	@$(call print,h3,"AWS")
	@$(call printDefListItem," - deploy","deploy using env profile [PROFILE=default VERBOSE=true STAGE=dev]")
	@$(call printDefListItem," - remove","remove using env profile [PROFILE=default VERBOSE=true STAGE=dev]")
	@echo ""
	@$(call print,h3,"Docker")
	@$(call printDefListItem," - build","build docker containers")
	@$(call printDefListItem," - up","launch docker containers [BUILD=false DETACH=false]")
	@$(call printDefListItem," - stop","stop all docker containers")
	@$(call printDefListItem," - down","down and remove all docker containers")
	@$(call printDefListItem," - systemdown","down and remove all docker containers (including outside this project)")
	@echo ""
	@$(call print,h3,"Postgres")
	@$(call printDefListItem," - psql-help","display PSQL help [USR=POSTGRES_USER]")
	@$(call printDefListItem," - psql","connect to PSQL or run PSQL command / SQL query (Q) or execute SQL file (F) [USR=POSTGRES_USER DB=POSTGRES_DB C= F=]")
	@$(call printDefListItem," - pg-dump", "back up specific PostgresSQL database data [USR=POSTGRES_USER DB=POSTGRES_DB]")
	@$(call printDefListItem," - pg-dump-all", "back up specific PostgresSQL database [USR=POSTGRES_USER DB=POSTGRES_DB]")
	@$(call printDefListItem," - pg-restore", "restore specific PostgresSQL database from dir [USR=POSTGRES_USER DB=POSTGRES_DB DIR=]")

# ------------------------------------------------------------
# initialize
# ------------------------------------------------------------

.PHONY: init
init: init-print init-envs copy-docker-compose
	@$(MAKE) build
	@$(call print,h3,"... success")

.PHONY: init-print
init-print:
	@$(call print,h3,"initializing ...")

.PHONY: copy-docker-compose
copy-docker-compose:
ifeq (,$(wildcard $(DOCKER_COMPOSE_FILENAME)))
	@$(call print,h3,"creating docker-compose file ...")
	@cp $(DOCKER_COMPOSE_TPL_FILENAME) $(DOCKER_COMPOSE_FILENAME)
endif

# -----------------------------
# init-envs
# -----------------------------

define create-envs
	@cp ".env.$(ENV).tpl" ".env"; \
	for env in $(1); do \
		cp ".env.$${env}.tpl" ".env.$${env}"; \
	done
endef

.PHONY: init-envs
init-envs:
	@$(call print,h3,"creating env files from templates ...")
	@$(call create-envs,$(ENVS))

# -----------------------------
# create-env
# -----------------------------

# TODO: make this more concise
.PHONY: _validate-tpl-envs
_validate-tpl-envs:
ifneq ($(shell $(ENV_LOCAL_TPL_DIFF)),)
	@$(call print,h2,"YOU HAVE ADDED ENVS TO .env.local PLEASE UPDATE .env.local.tpl WITH",LIGHTRED)
	@$(call printList,"$$(echo $$($(ENV_LOCAL_TPL_DIFF)) | tr ' ' ';')",GOLD)
endif
ifneq ($(shell $(ENV_DEV_TPL_DIFF)),)
	@$(call print,h2,"YOU HAVE ADDED ENVS TO .env.dev PLEASE UPDATE .env.dev.tpl WITH",LIGHTRED)
	@$(call printList,"$$(echo $$($(ENV_DEV_TPL_DIFF)) | tr ' ' ';')",GOLD)
endif
ifneq ($(shell $(ENV_STAGING_TPL_DIFF)),)
	@$(call print,h2,"YOU HAVE ADDED ENVS TO .env.staging PLEASE UPDATE .env.staging.tpl WITH",LIGHTRED)
	@$(call printList,"$$(echo $$($(ENV_STAGING_TPL_DIFF)) | tr ' ' ';')",GOLD)
endif
ifneq ($(shell $(ENV_TEST_TPL_DIFF)),)
	@$(call print,h2,"YOU HAVE ADDED ENVS TO .env.test PLEASE UPDATE .env.test.tpl WITH",LIGHTRED)
	@$(call printList,"$$(echo $$($(ENV_TEST_TPL_DIFF)) | tr ' ' ';')",GOLD)
endif
ifneq ($(shell $(ENV_LOCAL_TPL_DIFF)),)
	@exit 2
endif
ifneq ($(shell $(ENV_DEV_TPL_DIFF)),)
	@exit 2
endif
ifneq ($(shell $(ENV_STAGING_TPL_DIFF)),)
	@exit 2
endif
ifneq ($(shell $(ENV_TEST_TPL_DIFF)),)
	@exit 2
endif

.PHONY: _validate-target-env
_validate-target-env:
ifneq ($(shell $(ENV_TARGET_DIFF)),)
	@$(call print,h2,"YOU ARE MISSING ENVS PLEASE UPDATE $(ENV_TARGET_FILENAME) WITH",LIGHTRED)
	@$(call printList,"$$(echo $$($(ENV_TARGET_DIFF)) | tr ' ' ';')",GOLD)
	@exit 2
endif

.PHONY: _create-env-from-target-env
_create-env-from-target-env:
	@rm -f $(ENV_FILENAME)
	@echo -e "# ----------------------------------------\n# $(ENV)\n# ----------------------------------------\n" >> $(ENV_FILENAME)
	@cat $(ENV_TARGET_FILENAME) >> $(ENV_FILENAME)

.PHONY: _create-env-yml-from-target-env
_create-env-yml-from-target-env:
	@rm -f $(ENV_FILENAME_SLS)
	@echo -e "# ----------------------------------------\n# $(ENV)\n# ----------------------------------------\n" >> $(ENV_FILENAME_SLS)
	@echo -e "local:" >> $(ENV_FILENAME_SLS)
	@sh ./scripts/create-yml-from-file.sh $(ENV_TARGET_FILENAME) $(ENV_FILENAME_SLS)

.PHONY: _check-target-env
_check-target-env:
ifeq (,$(wildcard $(ENV_TARGET_FILENAME)))
	@$(call print,h2,"YOU ARE MISSING $(ENV_TARGET_FILENAME) PLEASE RUN \`\`npm run init\`\` OR CREATE MANUALLY")
	@exit 2
endif

.PHONY: _create-env-h
_create-env-h:
	@$(call print,h3,"creating $(ENV_FILENAME) for target environment: $(ENV) ...")

.PHONY: create-env
create-env: _create-env-h _check-target-env _validate-target-env _create-env-from-target-env _create-env-yml-from-target-env

# -----------------------------------------------------------
# aws
# -----------------------------------------------------------

.PHONY: remove
remove: PROFILE?=$(or ${AWS_PROFILE},"default")
remove: VERBOSE?=true
remove: STAGE?=dev
remove:
ifeq ($(VERBOSE),true)
	@AWS_PROFILE=$(PROFILE) sls remove -v -s $(STAGE)
else
	@AWS_PROFILE=$(PROFILE) sls remove -s $(STAGE)
endif

.PHONY: deploy
deploy: PROFILE?=$(or ${AWS_PROFILE},"default")
deploy: VERBOSE?=true
deploy: STAGE?=dev
deploy:
ifeq ($(VERBOSE),true)
	@AWS_PROFILE=$(PROFILE) sls deploy -v -s $(STAGE)
else
	@AWS_PROFILE=$(PROFILE) sls deploy -s $(STAGE)
endif

# -----------------------------------------------------------
# docker
# -----------------------------------------------------------

.PHONY: up
up: BUILD?=false
up: DETACH?=false
up:
ifeq ($(DETACH),true)
	@$(eval ARGS=$(ARGS) -d)
endif
ifeq ($(BUILD),true)
	@$(eval ARGS=$(ARGS) --build)
endif
	@$(call print,h3,"launching docker containers...")
	@$(call print,h2,"docker-compose f $(DOCKER_COMPOSE_FILENAME) up $(ARGS)")
	@trap 'docker-compose -f $(DOCKER_COMPOSE_FILENAME) stop' EXIT; docker-compose -f $(DOCKER_COMPOSE_FILENAME) up $(ARGS)

.PHONY: build
build:
build:
	@$(call print,h3,"building docker containers...")
	@$(call print,h2,"docker-compose -f $(DOCKER_COMPOSE_FILENAME) build")
	@docker-compose -f $(DOCKER_COMPOSE_FILENAME) build

.PHONY: stop
stop:
	@$(call print,h3,"stopping all docker containers ...")
	@-docker-compose stop
	@$(call print,h3,"... complete")

.PHONY: down
down:
	@$(call print,h3,"downing and removing all docker containers ...")
	@-docker-compose down
	@$(call print,h3,"... complete")

.PHONY: systemdown
systemdown:
	@$(call print,h3,"downing and removing all docker containers (including outside this project)...")
	@-docker stop `docker ps -aq`
	@-docker rm `docker ps -aq`
	@$(call print,h3,"... complete")

# -----------------------------------------------------------
# postgres
# -----------------------------------------------------------

.PHONY: _up-postgres
_up-postgres:
	@$(call print,h3,"launching Postgres docker container ...")
	@docker-compose -f $(DOCKER_COMPOSE_FILENAME) up -d $(POSTGRES_CONTAINER)
	@$(call print,h3,"waiting to ensure container is available ...")
	@sleep $(POSTGRES_CONTAINER_UP_WAIT_TIME)

.PHONY: _up-build-postgres
_up-build-postgres:
	@$(call print,h3,"rebuilding and launching Postgres docker container ...")
	@docker-compose -f $(DOCKER_COMPOSE_FILENAME) up --build -d $(POSTGRES_CONTAINER)
	@$(call print,h3,"waiting to ensure container is available ...")
	@sleep $(POSTGRES_CONTAINER_UP_WAIT_TIME)

.PHONY: _stop-postgres
_stop-postgres:
	@$(call print,h3,"stopping Postgres docker container ...")
	@docker-compose stop $(POSTGRES_CONTAINER)
	@$(call print,h3,"... complete")

.PHONY: psql-help
psql-help: USR?=$(POSTGRES_USER)
psql-help:
ifeq ($$($(POSTGRES_CONTAINER_RUNNING)),false)
	@$(MAKE) _up-postgres
endif
	@$(call print,h1,"displaying PSQL help ...")
	@$(call print,h3,"docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec -T $(POSTGRES_CONTAINER) psql -U --help")
	@docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec $(POSTGRES_CONTAINER) psql -U $(USR) --help
	@$(call print,h3,"... complete")
ifeq ($$($(POSTGRES_CONTAINER_RUNNING)),false)
	@$(MAKE) _stop-postgres
endif

.PHONY: psql
psql: USR?=$(POSTGRES_USER)
psql: DB?=$(POSTGRES_DB)
psql: Q?=
psql: F?=
psql:
ifeq ($$($(POSTGRES_CONTAINER_RUNNING)),false)
	@$(MAKE) _up-build-postgres
endif
ifneq ($(F),)
	@$(call print,h3,"executing SQL file: $(F) on db: $(DB) ...")
	@$(call print,h2,"docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec -T $(POSTGRES_CONTAINER) psql -U $(USR) $(DB) < $(F)")
	@docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec -T $(POSTGRES_CONTAINER) psql -U $(USR) $(DB) < $(F)
else ifneq ($(Q),)
	@$(call print,h3,"executing PSQL command or query ...")
	@$(call print,h2,"docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec -T $(POSTGRES_CONTAINER) psql -U $(USR) -d $(DB) -c \"$(Q)\"")
	@docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec -T $(POSTGRES_CONTAINER) psql -U $(USR) -d $(DB) -c "$(Q)"
else
	@$(call print,h3,"connecting to PSQL ...")
	@$(call print,h2,"docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec -T $(POSTGRES_CONTAINER) psql -U $(USR) -d $(DB)")
	@docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec $(POSTGRES_CONTAINER) psql -U $(USR) -d $(DB)
endif
ifeq ($$($(POSTGRES_CONTAINER_RUNNING)),false)
	@$(MAKE) _stop-postgres
endif

.PHONY: pg-dump
pg-dump: USR?=$(POSTGRES_USER)
pg-dump: DB?=$(POSTGRES_DB)
pg-dump: TABLE?=
pg-dump:
ifeq ($$($(POSTGRES_CONTAINER_RUNNING)),false)
	@$(MAKE) _up-postgres
endif
	@$(call print,h3,"backing up PostgresSQL database: $(DB) ...")
	@if [ ! -d "$(BACKUP_DIR)" ]; then mkdir $(BACKUP_DIR); fi
ifneq ($(TABLE),)
	@docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec $(POSTGRES_CONTAINER) pg_dump --data-only --table=$(TABLE) -U $(USR) -d $(DB) > $(BACKUP_DB_FILE)
else
	@docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec $(POSTGRES_CONTAINER) pg_dump --data-only -U $(USR) -d $(DB) > $(BACKUP_DB_FILE)
endif
	@$(call print,h3,"... complete")
ifeq ($$($(POSTGRES_CONTAINER_RUNNING)),false)
	@$(MAKE) _stop-postgres
endif

.PHONY: pg-dump-all
pg-dump-all: USR?=$(POSTGRES_USER)
pg-dump-all: DB?=$(POSTGRES_DB)
pg-dump-all: TABLE?=
pg-dump-all:
ifeq ($$($(POSTGRES_CONTAINER_RUNNING)),false)
	@$(MAKE) _up-postgres
endif
	@$(call print,h3,"backing up PostgresSQL database: $(DB) ...")
	@if [ ! -d "$(BACKUP_DIR)" ]; then mkdir $(BACKUP_DIR); fi
ifneq ($(TABLE),)
	@docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec $(POSTGRES_CONTAINER) pg_dump --table=$(TABLE) -U $(USR) -d $(DB) > $(BACKUP_DB_FILE)
else
	@docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec $(POSTGRES_CONTAINER) pg_dump -U $(USR) -d $(DB) > $(BACKUP_DB_FILE)
endif
	@$(call print,h3,"... complete")
ifeq ($$($(POSTGRES_CONTAINER_RUNNING)),false)
	@$(MAKE) _stop-postgres
endif

.PHONY: pg-restore
pg-restore: USR?=$(POSTGRES_USER)
pg-restore: DB?=$(POSTGRES_DB)
pg-restore: DIR?=
pg-restore: _up-postgres
ifeq ($(DIR),)
	@$(error DIR arg is required)
else
	@$(call print,h3,"restoring database ...")
	@$(call print,h2,"docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec $(POSTGRES_CONTAINER) pg_restore -U $(USR) -d $(DB) $(DIR)")
	@docker-compose -f $(DOCKER_COMPOSE_FILENAME) exec $(POSTGRES_CONTAINER) pg_restore -U $(USR) -d $(DB) $(DIR)
endif
	@$(MAKE) _stop-postgres

# -----------------------------------------------------------
# API CURL commands
# -----------------------------------------------------------

# -----------------------------
# /actors
# -----------------------------

.PHONY: get-actors
get-actors: _validate-target-env
	@$(call _curl_api,"/actors") | jq .

# -----------------------------
# /addresses
# -----------------------------

.PHONY: get-addresses
get-addresses: _validate-target-env
	@$(call _curl_api,"/addresses") | jq .
