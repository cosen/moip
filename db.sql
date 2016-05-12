DROP DATABASE IF EXISTS j2w1xpr3s01xy8ob;

CREATE DATABASE j2w1xpr3s01xy8ob;

USE j2w1xpr3s01xy8ob;

CREATE TABLE `produtos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `preco` double NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `pedidos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `moip_id` varchar(50) DEFAULT NULL,
  `pagamento_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `itens` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `produto_id` bigint(20) DEFAULT NULL,
  `pedido_id` bigint(20) DEFAULT NULL,
  `quantidade` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_itens_1_idx` (`produto_id`),
  KEY `fk_itens_2_idx` (`pedido_id`),
  CONSTRAINT `fk_itens_1` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_itens_2` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);




