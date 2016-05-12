DROP DATABASE IF EXISTS j2w1xpr3s01xy8ob;

CREATE DATABASE j2w1xpr3s01xy8ob;
 
CREATE TABLE j2w1xpr3s01xy8ob.produtos (
	id BIGINT NULL AUTO_INCREMENT, 
	nome VARCHAR(45) NOT NULL, 
	descricao VARCHAR(255) NOT NULL, 
	preco DOUBLE NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE j2w1xpr3s01xy8ob.pedidos (
  id bigint(20) NOT NULL AUTO_INCREMENT,
  produto_id bigint(20) NOT NULL,
  valor double DEFAULT NULL,
  id_moip varchar(45) DEFAULT NULL,
  pagamento_id varchar(45) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY fk_pedidos_1_idx (produto_id),
  CONSTRAINT fk_pedidos_1 FOREIGN KEY (produto_id) REFERENCES produtos (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);


