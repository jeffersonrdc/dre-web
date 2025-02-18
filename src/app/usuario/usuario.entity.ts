import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import {hashSync} from 'bcrypt';

@Entity('usuario')
export class UsuarioEntity {
    @PrimaryGeneratedColumn()
    ID_Usuario: number;

    @Column({ length: 100, unique: true })
    NM_Email: string;

    @Column({ length: 255 })
    NM_Senha: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    DT_Criacao: Date;

    @Column({ type: 'timestamp', nullable: true })
    DT_Atualizacao: Date;

    @Column({ type: 'int', nullable: true })
    ID_UsuarioCriacao: number;

    @Column({ type: 'int', nullable: true })
    ID_UsuarioAtualizacao: number;

    @Column({ type: 'tinyint', default: 1 })
    IS_Ativo: number;

    @BeforeInsert()
    hashPassword() {
        this.NM_Senha = hashSync(this.NM_Senha, 10);
    }
}