-- CreateTable
CREATE TABLE `Facultad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Escuela` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `facultadId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grupo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `equipoTorneoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sorteo` (
    `localId` INTEGER NOT NULL,
    `visitanteId` INTEGER NOT NULL,
    `canchaId` INTEGER NOT NULL,
    `arbitroId` INTEGER NOT NULL,
    `fechaEncuentro` DATETIME(3) NULL,
    `sorteoCol` VARCHAR(191) NULL,

    PRIMARY KEY (`localId`, `visitanteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cedula` VARCHAR(191) NOT NULL,
    `nombres` VARCHAR(191) NOT NULL,
    `apellidos` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'CAPITAN', 'ESTUDIANTE') NOT NULL DEFAULT 'ESTUDIANTE',
    `facultad` VARCHAR(191) NULL,
    `carrera` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_cedula_key`(`cedula`),
    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campeonato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `anio` INTEGER NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFin` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Torneo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campeonatoId` INTEGER NOT NULL,
    `disciplina` VARCHAR(191) NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `genero` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `facultad` VARCHAR(191) NULL,
    `capitanId` INTEGER NOT NULL,

    UNIQUE INDEX `Equipo_capitanId_key`(`capitanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MiembroEquipo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipoId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,

    UNIQUE INDEX `MiembroEquipo_equipoId_usuarioId_key`(`equipoId`, `usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EquipoTorneo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipoId` INTEGER NOT NULL,
    `torneoId` INTEGER NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'INSCRITO',

    UNIQUE INDEX `EquipoTorneo_equipoId_torneoId_key`(`equipoId`, `torneoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ValidacionPago` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipoId` INTEGER NOT NULL,
    `usuarioPagoId` INTEGER NOT NULL,
    `monto` DECIMAL(65, 30) NOT NULL,
    `comprobanteUrl` VARCHAR(191) NOT NULL,
    `estado` ENUM('PENDIENTE', 'VALIDADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
    `fechaSubida` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `validadoPorId` INTEGER NULL,
    `observacion` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cancha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `ubicacion` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Arbitro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombres` VARCHAR(191) NOT NULL,
    `contacto` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Partido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `torneoId` INTEGER NOT NULL,
    `canchaId` INTEGER NULL,
    `arbitroId` INTEGER NULL,
    `equipoLocalId` INTEGER NULL,
    `equipoVisitanteId` INTEGER NULL,
    `fechaHora` DATETIME(3) NOT NULL,
    `estado` ENUM('PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO') NOT NULL DEFAULT 'PROGRAMADO',
    `marcadorLocal` INTEGER NULL DEFAULT 0,
    `marcadorVisitante` INTEGER NULL DEFAULT 0,
    `fase` VARCHAR(191) NULL,
    `llave` VARCHAR(191) NULL,
    `siguientePartidoId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Streaming` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partidoId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `isLive` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Streaming_partidoId_key`(`partidoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NULL,
    `mensaje` TEXT NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Escuela` ADD CONSTRAINT `Escuela_facultadId_fkey` FOREIGN KEY (`facultadId`) REFERENCES `Facultad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grupo` ADD CONSTRAINT `Grupo_equipoTorneoId_fkey` FOREIGN KEY (`equipoTorneoId`) REFERENCES `EquipoTorneo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sorteo` ADD CONSTRAINT `Sorteo_localId_fkey` FOREIGN KEY (`localId`) REFERENCES `Grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sorteo` ADD CONSTRAINT `Sorteo_visitanteId_fkey` FOREIGN KEY (`visitanteId`) REFERENCES `Grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sorteo` ADD CONSTRAINT `Sorteo_canchaId_fkey` FOREIGN KEY (`canchaId`) REFERENCES `Cancha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sorteo` ADD CONSTRAINT `Sorteo_arbitroId_fkey` FOREIGN KEY (`arbitroId`) REFERENCES `Arbitro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Torneo` ADD CONSTRAINT `Torneo_campeonatoId_fkey` FOREIGN KEY (`campeonatoId`) REFERENCES `Campeonato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipo` ADD CONSTRAINT `Equipo_capitanId_fkey` FOREIGN KEY (`capitanId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MiembroEquipo` ADD CONSTRAINT `MiembroEquipo_equipoId_fkey` FOREIGN KEY (`equipoId`) REFERENCES `Equipo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MiembroEquipo` ADD CONSTRAINT `MiembroEquipo_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipoTorneo` ADD CONSTRAINT `EquipoTorneo_equipoId_fkey` FOREIGN KEY (`equipoId`) REFERENCES `Equipo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipoTorneo` ADD CONSTRAINT `EquipoTorneo_torneoId_fkey` FOREIGN KEY (`torneoId`) REFERENCES `Torneo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValidacionPago` ADD CONSTRAINT `ValidacionPago_equipoId_fkey` FOREIGN KEY (`equipoId`) REFERENCES `Equipo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValidacionPago` ADD CONSTRAINT `ValidacionPago_usuarioPagoId_fkey` FOREIGN KEY (`usuarioPagoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValidacionPago` ADD CONSTRAINT `ValidacionPago_validadoPorId_fkey` FOREIGN KEY (`validadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Partido` ADD CONSTRAINT `Partido_torneoId_fkey` FOREIGN KEY (`torneoId`) REFERENCES `Torneo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Partido` ADD CONSTRAINT `Partido_canchaId_fkey` FOREIGN KEY (`canchaId`) REFERENCES `Cancha`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Partido` ADD CONSTRAINT `Partido_arbitroId_fkey` FOREIGN KEY (`arbitroId`) REFERENCES `Arbitro`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Partido` ADD CONSTRAINT `Partido_equipoLocalId_fkey` FOREIGN KEY (`equipoLocalId`) REFERENCES `Equipo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Partido` ADD CONSTRAINT `Partido_equipoVisitanteId_fkey` FOREIGN KEY (`equipoVisitanteId`) REFERENCES `Equipo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Streaming` ADD CONSTRAINT `Streaming_partidoId_fkey` FOREIGN KEY (`partidoId`) REFERENCES `Partido`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
