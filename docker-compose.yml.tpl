version: '3'

services:
  postgres:
    image: postgres:10.6
    env_file:
      - .env
    ports:
      - "15432:5432"
    volumes:
      - .backups/data:/playground/backups/data
      - ./data:/playground/data

  postgres_test:
    image: postgres:10.6
    env_file:
      - .env.test
    ports:
      - "5432:5432"
