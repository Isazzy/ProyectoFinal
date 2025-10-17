--
-- Create model Clientes
--
CREATE TABLE `clientes` (`id_cli` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `nombre_cli` varchar(50) NOT NULL, `apellido_cli` varchar(50) NOT NULL, `correo_cli` varchar(255) NOT NULL, `telefono_cli` varchar(30) NULL);
--
-- Create model DetVentas
--
CREATE TABLE `det_ventas` (`id_det_venta` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `precio_unitario` numeric(10, 2) NOT NULL, `cantidad_venta` integer NOT NULL, `subtotal` numeric(10, 2) NOT NULL);
--
-- Create model Productos
--
CREATE TABLE `productos` (`id_prod` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `nombre_prod` varchar(100) NOT NULL, `precio_venta` numeric(10, 2) NOT NULL, `precio_compra` numeric(10, 2) NOT NULL, `stock_min_prod` integer NOT NULL, `stock_act_prod` integer NOT NULL, `reposicion_prod` integer NOT NULL, `stock_max_prod` integer NOT NULL, `tipo_prod` varchar(50) NOT NULL);
--
-- Create model ProductosXProveedores
--
CREATE TABLE `productos_x_proveedores` (`id_prod_x_prov` integer AUTO_INCREMENT NOT NULL PRIMARY KEY);
--
-- Create model Profile
--
CREATE TABLE `mitiempo_enloderomi_profile` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `avatar` varchar(100) NULL, `telefono` varchar(30) NULL, `direccion` longtext NULL);
--
-- Create model Proveedores
--
CREATE TABLE `proveedores` (`id_prov` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `nombre_prov` varchar(100) NOT NULL, `tipo_prov` varchar(50) NULL, `telefono` varchar(20) NULL, `correo` varchar(150) NULL, `direccion` varchar(150) NULL);
--
-- Create model Ventas
--
CREATE TABLE `ventas` (`id_venta` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `fech_hs_vent` datetime(6) NOT NULL, `tipo_venta` varchar(100) NOT NULL, `total_venta` numeric(10, 2) NOT NULL, `tipo_pago` varchar(100) NOT NULL);
--
-- Create model CustomUser
--
CREATE TABLE `mitiempo_enloderomi_customuser` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `password` varchar(128) NOT NULL, `last_login` datetime(6) NULL, `is_superuser` bool NOT NULL, `username` varchar(150) NOT NULL UNIQUE, `first_name` varchar(150) NOT NULL, `last_name` varchar(150) NOT NULL, `is_staff` bool NOT NULL, `is_active` bool NOT NULL, `date_joined` datetime(6) NOT NULL, `email` varchar(254) NOT NULL UNIQUE, `role` varchar(10) NOT NULL);
CREATE TABLE `mitiempo_enloderomi_customuser_groups` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `customuser_id` bigint NOT NULL, `group_id` integer NOT NULL);
CREATE TABLE `mitiempo_enloderomi_customuser_user_permissions` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `customuser_id` bigint NOT NULL, `permission_id` integer NOT NULL);
--
-- Create model Cajas
--
CREATE TABLE `cajas` (`id_caja` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `fech_hrs_ape` datetime(6) NOT NULL, `fech_hrs_cie` datetime(6) NULL, `monto_ini` numeric(10, 2) NOT NULL, `total_ingreso` numeric(10, 2) NOT NULL, `total_egreso` numeric(10, 2) NOT NULL, `total_caja` numeric(10, 2) NOT NULL, `estado_caja` integer NOT NULL, `id_usuario` bigint NULL);
--
-- Create model Compras
--
CREATE TABLE `compras` (`id_compra` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `nro_comp` integer NOT NULL, `fecha_hs_comp` datetime(6) NOT NULL, `monto` numeric(10, 2) NOT NULL, `estado` varchar(9) NOT NULL, `id_caja` integer NOT NULL);
--
-- Create model DetCompras
--
CREATE TABLE `det_compras` (`id_det_comp` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `cantidad` integer NOT NULL, `precio_uni` numeric(10, 2) NOT NULL, `subtotal` numeric(10, 2) NOT NULL, `total` numeric(10, 2) NOT NULL, `id_comp` integer NOT NULL);
ALTER TABLE `mitiempo_enloderomi_customuser_groups` ADD CONSTRAINT `mitiempo_enloderomi_cust_customuser_id_group_id_e648cf92_uniq` UNIQUE (`customuser_id`, `group_id`);
ALTER TABLE `mitiempo_enloderomi_customuser_groups` ADD CONSTRAINT `mitiempo_enloderomi__customuser_id_d1a4e927_fk_mitiempo_` FOREIGN KEY (`customuser_id`) REFERENCES `mitiempo_enloderomi_customuser` (`id`);
ALTER TABLE `mitiempo_enloderomi_customuser_groups` ADD CONSTRAINT `mitiempo_enloderomi__group_id_65a7c9cf_fk_auth_grou` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);
ALTER TABLE `mitiempo_enloderomi_customuser_user_permissions` ADD CONSTRAINT `mitiempo_enloderomi_cust_customuser_id_permission_666b1d5e_uniq` UNIQUE (`customuser_id`, `permission_id`);
ALTER TABLE `mitiempo_enloderomi_customuser_user_permissions` ADD CONSTRAINT `mitiempo_enloderomi__customuser_id_47003d39_fk_mitiempo_` FOREIGN KEY (`customuser_id`) REFERENCES `mitiempo_enloderomi_customuser` (`id`);
ALTER TABLE `mitiempo_enloderomi_customuser_user_permissions` ADD CONSTRAINT `mitiempo_enloderomi__permission_id_f769fcf0_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`);
ALTER TABLE `cajas` ADD CONSTRAINT `cajas_id_usuario_133c21ab_fk_mitiempo_enloderomi_customuser_id` FOREIGN KEY (`id_usuario`) REFERENCES `mitiempo_enloderomi_customuser` (`id`);
ALTER TABLE `compras` ADD CONSTRAINT `compras_id_caja_20c9156b_fk_cajas_id_caja` FOREIGN KEY (`id_caja`) REFERENCES `cajas` (`id_caja`);
ALTER TABLE `det_compras` ADD CONSTRAINT `det_compras_id_comp_a1fab108_fk_compras_id_compra` FOREIGN KEY (`id_comp`) REFERENCES `compras` (`id_compra`);
