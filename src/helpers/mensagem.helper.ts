export const mensagemHelper = {
    usuario: {
        email: {
            required: 'O email é obrigatório',
        },
        senha: {
            required: 'A senha é obrigatória',
            invalid: 'A senha deve conter letra maiúscula, letra minúscula, número e caracteres especiais',
        },
    },
    login: {
        invalid: 'Email ou senha inválidos',
        success: 'Login realizado com sucesso'
    },
    importacao: {
        contaBancaria: {
            required: 'A conta bancária é obrigatória',
            invalid: 'O campo ID_ContaBancaria deve ser um número maior que 0',
            invalid_number: 'O campo ID_ContaBancaria deve ser um número',
        },
        ofx: {
            invalid: 'Arquivo inválido! Verifique.',
            erro: 'Erro ao processar o arquivo.',
            notFound_STMTTRNRS_or_STMTRS: 'STMTTRNRS ou STMTRS não encontrado na estrutura do arquivo OFX.'

        },
        csv: {

        }
    },
    token: {
        invalid: 'Token inválido ou expirado',
        notFound: 'Token não encontrado.',
        refreshToken: {
            invalid: 'Refresh Token inválido ou expirado.',
            notFound: 'Refresh Token não encontrado.',
            success: 'Token renovado com sucesso'
        }
    }
};
