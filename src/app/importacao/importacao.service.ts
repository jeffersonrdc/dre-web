import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ImportacaoEntity } from './importacao.entity';
import * as fs from 'fs';
import * as ofxParser from 'ofx-parser';

@Injectable()
export class ImportacaoService {
    constructor(
        @InjectRepository(ImportacaoEntity)
        private importacaoRepository: Repository<ImportacaoEntity>,
    ) { }

    async create(importacao: ImportacaoEntity): Promise<ImportacaoEntity> {
        return this.importacaoRepository.save(importacao);
    }

    async findAll(): Promise<ImportacaoEntity[]> {
        return this.importacaoRepository.find();
    }

    async findOne(id: number): Promise<ImportacaoEntity | null> {
        return this.importacaoRepository.findOne({ where: { ID_Importacao: id } });
    }

    async update(id: number, importacao: ImportacaoEntity): Promise<ImportacaoEntity | null> {
        await this.importacaoRepository.update(id, importacao);
        return this.findOne(id);
    }

    async delete(id: number): Promise<void> {
        await this.importacaoRepository.delete(id);
    }

    async importacaoOFX(file: Express.Multer.File): Promise<any> {
        try {
            // Cria o diretório uploads se não existir
            const uploadDir = './uploads/ofx';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Salva o arquivo em disco
            const filePath = `${uploadDir}/${file.originalname}`;
            fs.writeFileSync(filePath, file.buffer);

            try {
                const ofxFile = fs.readFileSync(filePath, 'utf-8');
                const parsedData = await ofxParser.parse(ofxFile);

                // Remove o arquivo após processamento
                fs.unlinkSync(filePath);

                // Verifica a existência de STMTTRNRS e extrai as transações
                const bankMessages = parsedData.OFX.BANKMSGSRSV1;
                if (bankMessages && bankMessages['STMTTRNRS'] && bankMessages['STMTTRNRS'].STMTRS) {
                    const transactions = bankMessages['STMTTRNRS'].STMTRS.BANKTRANLIST.STMTTRN;

                    // Mapeia as transações para um formato mais amigável
                    const formattedTransactions = transactions.map(transaction => ({
                        type: transaction.TRNTYPE,
                        date: transaction.DTPOSTED,
                        amount: transaction.TRNAMT,
                        fitId: transaction.FITID,
                        memo: transaction.MEMO,
                    }));

                    return {
                        success: true,
                        data: formattedTransactions,
                        bankInfo: {
                            bankId: bankMessages['STMTTRNRS'].STMTRS.BANKACCTFROM.BANKID,
                            accountId: bankMessages['STMTTRNRS'].STMTRS.BANKACCTFROM.ACCTID,
                            accountType: bankMessages['STMTTRNRS'].STMTRS.BANKACCTFROM.ACCTTYPE,
                            curdef: bankMessages['STMTTRNRS'].STMTRS.CURDEF
                        }
                    };
                } else {
                    throw new Error('STMTTRNRS não encontrado na estrutura do arquivo OFX.');
                }
            } catch (error) {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                throw error;
            }
        } catch (error) {
            return {
                success: false,
                message: 'Erro ao processar o arquivo',
                error: error.message
            };
        }
    }

    async importacaoCSV(file: Express.Multer.File): Promise<any> {
        try {
            // Cria o diretório uploads se não existir
            const uploadDir = './uploads/csv';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Salva o arquivo em disco
            const filePath = `${uploadDir}/${file.originalname}`;
            fs.writeFileSync(filePath, file.buffer);

            return { message: 'Arquivo CSV processado com sucesso' };
        } catch (error) {
            return {
                message: 'Erro ao processar o arquivo',
                error: error.message
            };
        }
    }
}
