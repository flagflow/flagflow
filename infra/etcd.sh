docker run -d --name etcd -p 2379:2379 --network=host -e ETCD_ROOT_PASSWORD=flagflow bitnami/etcd:3.6.1-debian-12-r2
