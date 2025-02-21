import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('importacao')
export class ImportacaoEntity {
    @PrimaryGeneratedColumn()
    ID_Importacao: number;

    @Column({ type: 'int', nullable: true })
    ID_TipoImportacao: number;

    @Column({ type: 'int', nullable: false })
    ID_ContaBancaria: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    NM_Arquivo: string;

    @Column({ type: 'timestamp', nullable: false })
    DT_Importacao: Date;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    DT_Criacao: Date;

    @Column({ type: 'timestamp', nullable: true })
    DT_Atualizacao: Date;

    @Column({ type: 'int', nullable: false })
    ID_UsuarioCriacao: number;

    @Column({ type: 'int', nullable: true })
    ID_UsuarioAtualizacao: number;

    @Column({ type: 'tinyint', default: 1 })
    IS_Ativo: number;
}
