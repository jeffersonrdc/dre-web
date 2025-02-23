import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ImportacaoEntity } from './importacao.entity';
import * as fs from 'fs';
import * as ofxParser from 'ofx-parser';
import { mensagemHelper } from 'src/helpers/mensagem.helper';
import { TipoImportacaoEnum } from './enum/tipo-importacao.enum';
import csvParser from 'csv-parser';

@Injectable()
export class ImportacaoService {
  constructor(
    @InjectRepository(ImportacaoEntity)
    private importacaoRepository: Repository<ImportacaoEntity>,
  ) {}

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

          // Mapeia as transações para um formato mais amigável
          const formattedTransactions = transactions.map((transaction) => ({
            type: transaction.TRNTYPE,
            date: transaction.DTPOSTED,
            amount: transaction.TRNAMT,
            fitId: transaction.FITID,
            memo: transaction.MEMO,

            /* if (transaction.TRNTYPE == 'OUT'){

                        } else {

                        } */
          }));

          const importacao = {
            NM_Arquivo: file.originalname,
            ID_ContaBancaria: body.ID_ContaBancaria,
            ID_UsuarioCriacao: body.ID_UsuarioCriacao,
            ID_TipoImportacao: TipoImportacaoEnum.OFX,
          };

          // Grava o registro de importação
          //const importacaoSalva = await this.create(importacao);

          return {
            success: true,
            importacao: bankMessages,
            data: formattedTransactions,
            bankInfo: {
              bankId: bankMessages['STMTTRNRS'].STMTRS.BANKACCTFROM.BANKID,
              accountId: bankMessages['STMTTRNRS'].STMTRS.BANKACCTFROM.ACCTID,
              accountType:
                bankMessages['STMTTRNRS'].STMTRS.BANKACCTFROM.ACCTTYPE,
              curdef: bankMessages['STMTTRNRS'].STMTRS.CURDEF,
            },
          };
        } else {
          throw new Error(
            mensagemHelper.importacao.ofx.notFound_STMTTRNRS_or_STMTRS,
          );
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
        message: mensagemHelper.importacao.ofx.erro,
      };
    }
  }

  async importacaoCSV(body: any, file: Express.Multer.File): Promise<any> {
    try {
      // Cria o diretório uploads se não existir
      const uploadDir = './uploads/csv';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Salva o arquivo em disco
      const filePath = `${uploadDir}/${file.originalname}`;
      fs.writeFileSync(filePath, file.buffer);

      // Processa o arquivo CSV
      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csvParser()) // Usando csv-parser para processar o CSV
        .on('data', (row) => results.push(row)) // Lê cada linha e adiciona ao array 'results'
        .on('end', () => {
          // Aqui você pode processar os dados extraídos do CSV conforme necessário
          console.log('Arquivo CSV processado:', results);
          // Por exemplo, você pode salvar no banco ou realizar outra operação.
        });

      return { message: 'Arquivo CSV processado com sucesso', data: results };
    } catch (error) {
      return {
        message: 'Erro ao processar o arquivo',
        error: error.message,
      };
    }
  }
}
