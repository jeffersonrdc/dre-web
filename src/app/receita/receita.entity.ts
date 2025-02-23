import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('receita')
export class ReceitaEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    ID_Receita: number;

    @Column({ type: 'int', nullable: true })
    ID_PlanoConta: number;

    @Column({ type: 'int', nullable: false })
    ID_ContaBancaria: number;

    @Column({ type: 'int', nullable: true })
    ID_Importacao: number;

    @Column({ type: 'int', nullable: true })
    ID_Transacao: number;

    @Column({ type: 'date', nullable: false })
    DT_Lancamento: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    VL_Receita: number;

    @Column({ type: 'varchar', nullable: true , length: 500})
    NM_Observacao: string;

    @Column({ type: 'int', nullable: false })
    ID_UsuarioCriacao: number;

    @Column({ type: 'int', nullable: true })
    ID_UsuarioAtualizacao: number;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    DT_Criacao: Date;

    @Column({ type: 'timestamp', nullable: true })
    DT_Atualizacao: Date;

    @Column({ type: 'tinyint', nullable: false, default: 1 })
    IS_Ativo: number;
}
