import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ImportacaoEntity } from './importacao.entity';
import * as fs from 'fs';
import * as ofxParser from 'ofx-parser';
import { mensagemHelper } from 'src/helpers/mensagem.helper';
import { TipoImportacaoEnum } from './enum/tipo-importacao.enum';
import * as csv from 'csv-parser';
import { ReceitaEntity } from '../receita/receita.entity';
import { DespesaEntity } from '../despesa/despesa.entity';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class ImportacaoService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(ImportacaoEntity)
    private importacaoRepository: Repository<ImportacaoEntity>,
    @InjectRepository(ReceitaEntity)
    private receitaRepository: Repository<ReceitaEntity>,
    @InjectRepository(DespesaEntity)
    private despesaRepository: Repository<DespesaEntity>,
  ) { }

  async create(transactions: any): Promise<ImportacaoEntity> {
    const importacao = new ImportacaoEntity();
    importacao.DT_Importacao = new Date();
    importacao.NM_Arquivo = transactions.NM_Arquivo;
    importacao.ID_ContaBancaria = transactions.ID_ContaBancaria;
    importacao.ID_TipoImportacao = transactions.ID_TipoImportacao;
    importacao.ID_UsuarioCriacao = transactions.ID_UsuarioCriacao;

    return this.importacaoRepository.save(importacao);
  }

  async findAll(): Promise<ImportacaoEntity[]> {
    return this.importacaoRepository.find();
  }

  async findOne(id: number): Promise<ImportacaoEntity | null> {
    return this.importacaoRepository.findOne({ where: { ID_Importacao: id } });
  }

  async update(
    id: number,
    importacao: ImportacaoEntity,
  ): Promise<ImportacaoEntity | null> {
    await this.importacaoRepository.update(id, importacao);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.importacaoRepository.delete(id);
  }

  async importacaoOFX(body: any, file: Express.Multer.File): Promise<any> {
    const queryRunner = this.importacaoRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
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
        if (
          bankMessages &&
          bankMessages['STMTTRNRS'] &&
          bankMessages['STMTTRNRS'].STMTRS
        ) {
          const transactions =
            bankMessages['STMTTRNRS'].STMTRS.BANKTRANLIST.STMTTRN;

          const ID_UsuarioCriacao = this.request['user']['ID_Usuario']; // acessa o sub do token

          const importacao = {
            NM_Arquivo: file.originalname,
            ID_ContaBancaria: body.ID_ContaBancaria,
            ID_UsuarioCriacao: ID_UsuarioCriacao,
            ID_TipoImportacao: TipoImportacaoEnum.OFX,
          };

          // Grava o registro de importação

          const importacaoSalva = await this.create(importacao);


          const formattedTransactions: any[] = [];
          for (const transaction of transactions) {
            const transactionData = {
              type: transaction.TRNTYPE,
              date: transaction.DTPOSTED,
              amount: transaction.TRNAMT,
              fitId: transaction.FITID,
              memo: transaction.MEMO,
            };

            const dataFormatada = new Date(
              transaction.DTPOSTED.substring(0, 4), // ano
              parseInt(transaction.DTPOSTED.substring(4, 6)) - 1, // mês (0-11)
              transaction.DTPOSTED.substring(6, 8));

            if (transaction.TRNTYPE === 'OUT') {
              const despesa = new DespesaEntity();
              despesa.DT_Lancamento = dataFormatada;
              despesa.VL_Despesa = Math.abs(parseFloat(transaction.TRNAMT));
              despesa.NM_Observacao = transaction.MEMO;
              despesa.ID_UsuarioCriacao = ID_UsuarioCriacao;
              despesa.ID_ContaBancaria = body.ID_ContaBancaria;
              despesa.ID_Importacao = importacaoSalva.ID_Importacao;
              await this.despesaRepository.save(despesa);
            } else {
              const receita = new ReceitaEntity();
              receita.DT_Lancamento = dataFormatada;
              receita.VL_Receita = transaction.TRNAMT;
              receita.NM_Observacao = transaction.MEMO;
              receita.ID_UsuarioCriacao = ID_UsuarioCriacao;
              receita.ID_ContaBancaria = body.ID_ContaBancaria;
              receita.ID_Importacao = importacaoSalva.ID_Importacao;
              await this.receitaRepository.save(receita);
            }

            formattedTransactions.push(transactionData);
          }
          await queryRunner.commitTransaction();


          return {
            success: true,
            data: formattedTransactions,
          };

        } else {
          await queryRunner.rollbackTransaction();
          throw new Error(
            mensagemHelper.importacao.ofx.notFound_STMTTRNRS_or_STMTRS,
          );
        }
      } catch (error) {
        await queryRunner.rollbackTransaction();
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw error;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return {
        success: false,
        message: mensagemHelper.importacao.ofx.erro,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async importacaoCSV(body: any, file: Express.Multer.File): Promise<any> {
    let filePath = '';
    try {
      // Cria o diretório uploads se não existir
      const uploadDir = './uploads/csv';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Salva o arquivo em disco
      filePath = `${uploadDir}/${file.originalname}`;
      fs.writeFileSync(filePath, file.buffer);

      // Processa o arquivo CSV usando Promise
      const results: any[] = [];

      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => results.push(row))
          .on('end', () => {
            // Limpa o arquivo após processamento
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            resolve({
              message: 'Arquivo CSV processado com sucesso',
              data: results
            });
          })
          .on('error', (error) => {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            reject({
              message: 'Erro ao processar o arquivo',
              error: error.message,
            });
          });
      });

    } catch (error) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return {
        message: 'Erro ao processar o arquivo',
        error: error.message,
      };
    }
  }
}
