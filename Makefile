# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: esafar <esafar@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2022/09/13 12:28:32 by c2h6              #+#    #+#              #
#    Updated: 2023/04/11 16:43:29 by esafar           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

all:	install up 

up:
	docker-compose up --build

install:
	(cd ./backend ; npm install)
	(cd ./frontend ; npm install)

gotoc:
	docker exec -it backend_nestjs bash

prisma:
	docker exec backend_nestjs npx prisma studio

update:
	docker build -t backend_nestjs ./backend

env:
	$(eval OAUTH_42_CLIENT_ID=$(shell bash -c 'read -p "OAUTH client ID: " secret; echo $$secret'))
	$(eval OAUTH_42_CLIENT_SECRET=$(shell bash -c 'read -p "OAUTH client secret (hidden): " secret; echo $$secret; echo >&2'))
	$(eval JWT_SECRET=$(shell head -c 21 /dev/urandom | base64))
	@echo "OAUTH_42_CLIENT_ID='$(OAUTH_42_CLIENT_ID)'" > backend/env_test/.env
	@echo "OAUTH_42_CLIENT_SECRET='$(OAUTH_42_CLIENT_SECRET)'" >> backend/env_test/.env
	@echo "JWT_SECRET='$(JWT_SECRET)'" >> backend/env_test/.env

	@echo "`tput setaf 2`⚙ Local dev environment generated."

info:
	@docker ps
	@echo "\n"
	@docker images
	@echo "\n"
	@docker volume ls
	@echo "\n"

down:
	docker-compose -f docker-compose.yml down

fclean: down
	docker rmi -f $$(docker images -qa);\
	docker volume rm $$(docker volume ls -q);\
	docker system prune -a --force

clean_modules:
	rm -rf ./backend/node_modules
	rm -rf ./frontend/node_modules

re:
	fclean
	all

.PHONY:	all up install schema prisma info down fclean clean_modules re