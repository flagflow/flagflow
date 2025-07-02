docker run -d --name keycloak -p 8080:8080 --network=host -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin keycloak/keycloak:26.2.5-0 start-dev
