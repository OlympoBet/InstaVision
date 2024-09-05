document.getElementById('instaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const budgetDiario = parseFloat(document.getElementById('budget_diario').value);
    const precoProduto = parseFloat(document.getElementById('preco_produto').value);
    
    if (isNaN(budgetDiario) || isNaN(precoProduto) || budgetDiario <= 0 || precoProduto <= 0) {
        alert('Por favor, insira valores válidos para o orçamento diário e o valor do produto.');
        return;
    }

    const alcance_por_budget = {
        10: [740, 2000],
        26: [1700, 4400],
        52: [3300, 8800],
        85.28: [5600, 15000],
        120: [7400, 20000],
        175: [11000, 29000],
        230: [15000, 39000],
        350: [22000, 59000],
        450: [30000, 78000],
        500: [33000, 88000],
        1100: [67000, 180000]
    };

    // Função para calcular o alcance estimado com base no orçamento
    function calcularAlcanceEstimado(budget) {
        const sortedBudgets = Object.keys(alcance_por_budget).map(Number).sort((a, b) => a - b);
        
        // Se o orçamento estiver dentro dos valores fornecidos
        if (budget <= sortedBudgets[0]) {
            // Extrapolação linear abaixo do mínimo
            const [alcanceMin, alcanceMax] = alcance_por_budget[sortedBudgets[0]];
            const incrementoMin = (alcanceMax - alcanceMin) / sortedBudgets[0];
            const alcanceEstimadoMin = incrementoMin * budget;
            const alcanceEstimadoMax = alcanceEstimadoMin * 2; // Supondo duplicação para alcance máximo
            return [alcanceEstimadoMin, alcanceEstimadoMax];
        } else if (budget >= sortedBudgets[sortedBudgets.length - 1]) {
            // Extrapolação linear acima do máximo
            const [alcanceMin, alcanceMax] = alcance_por_budget[sortedBudgets[sortedBudgets.length - 1]];
            const incrementoMin = (alcanceMax - alcanceMin) / (sortedBudgets[sortedBudgets.length - 1] - sortedBudgets[sortedBudgets.length - 2]);
            const incrementoMax = incrementoMin;
            const alcanceEstimadoMin = alcanceMin + incrementoMin * (budget - sortedBudgets[sortedBudgets.length - 1]);
            const alcanceEstimadoMax = alcanceMax + incrementoMax * (budget - sortedBudgets[sortedBudgets.length - 1]);
            return [alcanceEstimadoMin, alcanceEstimadoMax];
        } else {
            // Interpolação linear entre os valores fornecidos
            for (let i = 0; i < sortedBudgets.length - 1; i++) {
                if (budget > sortedBudgets[i] && budget < sortedBudgets[i + 1]) {
                    const [alcanceMin1, alcanceMax1] = alcance_por_budget[sortedBudgets[i]];
                    const [alcanceMin2, alcanceMax2] = alcance_por_budget[sortedBudgets[i + 1]];
                    const incrementoMin = (alcanceMin2 - alcanceMin1) / (sortedBudgets[i + 1] - sortedBudgets[i]);
                    const incrementoMax = (alcanceMax2 - alcanceMax1) / (sortedBudgets[i + 1] - sortedBudgets[i]);
                    const alcanceEstimadoMin = alcanceMin1 + incrementoMin * (budget - sortedBudgets[i]);
                    const alcanceEstimadoMax = alcanceMax1 + incrementoMax * (budget - sortedBudgets[i]);
                    return [alcanceEstimadoMin, alcanceEstimadoMax];
                }
            }
        }
    }

    const [alcanceMin, alcanceMax] = calcularAlcanceEstimado(budgetDiario);
    const alcanceMedio = (alcanceMin + alcanceMax) / 2;
    const ctrMin = 0.01, ctrMax = 0.02;
    const conversaoCliquesSiteMin = 0.05, conversaoCliquesSiteMax = 0.30;
    const conversaoCheckout = 0.30, conversaoPix = 0.40;

    const cliquesMin = alcanceMedio * ctrMin;
    const cliquesMax = alcanceMedio * ctrMax;
    const cliquesSiteMin = cliquesMin * conversaoCliquesSiteMin;
    const cliquesSiteMax = cliquesMax * conversaoCliquesSiteMax;
    const checkoutsMin = cliquesSiteMin * conversaoCheckout;
    const checkoutsMax = cliquesSiteMax * conversaoCheckout;
    const pixMin = checkoutsMin * conversaoPix;
    const pixMax = checkoutsMax * conversaoPix;

    const receitaMinDiaria = pixMin * precoProduto;
    const receitaMaxDiaria = pixMax * precoProduto;

    const receitaMin7Dias = receitaMinDiaria * 7;
    const receitaMax7Dias = receitaMaxDiaria * 7;
    const receitaMin15Dias = receitaMinDiaria * 15;
    const receitaMax15Dias = receitaMaxDiaria * 15;
    const receitaMin30Dias = receitaMinDiaria * 30;
    const receitaMax30Dias = receitaMaxDiaria * 30;

    // Calcular as médias dos resultados
    const mediaReceitaDiaria = (receitaMinDiaria + receitaMaxDiaria) / 2;
    const mediaReceita7Dias = (receitaMin7Dias + receitaMax7Dias) / 2;
    const mediaReceita15Dias = (receitaMin15Dias + receitaMax15Dias) / 2;
    const mediaReceita30Dias = (receitaMin30Dias + receitaMax30Dias) / 2;

    // Calcular os percentuais de conversão no funil
    const percentualCliquesAnuncio = ((cliquesMin + cliquesMax) / 2 / alcanceMedio) * 100;
    const percentualCliquesSite = ((cliquesSiteMin + cliquesSiteMax) / 2 / (cliquesMin + cliquesMax) * 2) * 100;
    const percentualCheckouts = ((checkoutsMin + checkoutsMax) / 2 / (cliquesSiteMin + cliquesSiteMax) * 2) * 100;
    const percentualPix = ((pixMin + pixMax) / 2 / (checkoutsMin + checkoutsMax) * 2) * 100;

    // Função para formatar números para o padrão brasileiro
    function formatarNumeroBR(numero) {
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = `
        <h3>Resultados da Projeção:</h3>
        <div class="result-item"><strong>Alcance Médio do Anúncio:</strong> ${alcanceMedio.toFixed(0)} pessoas</div>
        <div class="result-item"><strong>Cliques no Anúncio:</strong> entre ${cliquesMin.toFixed(0)} e ${cliquesMax.toFixed(0)} (${percentualCliquesAnuncio.toFixed(2)}%)</div>
        <div class="result-item"><strong>Cliques no Site:</strong> entre ${cliquesSiteMin.toFixed(0)} e ${cliquesSiteMax.toFixed(0)} (${percentualCliquesSite.toFixed(2)}%)</div>
        <div class="result-item"><strong>Checkouts Realizados:</strong> entre ${checkoutsMin.toFixed(0)} e ${checkoutsMax.toFixed(0)} (${percentualCheckouts.toFixed(2)}%)</div>
        <div class="result-item"><strong>Pagamentos via Pix:</strong> entre ${pixMin.toFixed(0)} e ${pixMax.toFixed(0)} (${percentualPix.toFixed(2)}%)</div>
        <div class="result-item"><strong>Receita Estimada Diária:</strong> entre ${formatarNumeroBR(receitaMinDiaria)} e ${formatarNumeroBR(receitaMaxDiaria)}</div>
        <div class="result-item"><strong>Receita Estimada para 7 dias:</strong> entre ${formatarNumeroBR(receitaMin7Dias)} e ${formatarNumeroBR(receitaMax7Dias)}</div>
        <div class="result-item"><strong>Receita Estimada para 15 dias:</strong> entre ${formatarNumeroBR(receitaMin15Dias)} e ${formatarNumeroBR(receitaMax15Dias)}</div>
        <div class="result-item"><strong>Receita Estimada para 30 dias:</strong> entre ${formatarNumeroBR(receitaMin30Dias)} e ${formatarNumeroBR(receitaMax30Dias)}</div>
    `;

    const mediasDiv = document.getElementById('medias');
    mediasDiv.innerHTML = `
        <h3>Médias dos Resultados:</h3>
        <div class="media-item"><strong>Média Receita Diária:</strong> ${formatarNumeroBR(mediaReceitaDiaria)}</div>
        <div class="media-item"><strong>Média Receita para 7 dias:</strong> ${formatarNumeroBR(mediaReceita7Dias)}</div>
        <div class="media-item"><strong>Média Receita para 15 dias:</strong> ${formatarNumeroBR(mediaReceita15Dias)}</div>
        <div class="media-item"><strong>Média Receita para 30 dias:</strong> ${formatarNumeroBR(mediaReceita30Dias)}</div>
    `;

    resultadosDiv.style.display = 'block';
    mediasDiv.style.display = 'block';

    // Exibe o botão Reiniciar
    const reiniciarBtn = document.getElementById('reiniciarBtn');
    reiniciarBtn.classList.remove('hidden');

    // Adiciona evento ao botão Reiniciar
    reiniciarBtn.addEventListener('click', function() {
        document.getElementById('instaForm').reset();
        resultadosDiv.innerHTML = '';
        mediasDiv.innerHTML = '';
        resultadosDiv.style.display = 'none';
        mediasDiv.style.display = 'none';
        reiniciarBtn.classList.add('hidden');
        popup.classList.add('hidden');
    });

    // Delay de 10 segundos para exibir o pop-up
    setTimeout(function() {
        const popup = document.getElementById('popup');
        popup.classList.remove('hidden');

        // Eventos para os botões do pop-up
        document.getElementById('novaConsultaBtn').addEventListener('click', function() {
            popup.classList.add('hidden');
            document.getElementById('instaForm').reset();
            resultadosDiv.innerHTML = '';
            mediasDiv.innerHTML = '';
            resultadosDiv.style.display = 'none';
            mediasDiv.style.display = 'none';
            reiniciarBtn.classList.add('hidden');
        });

        document.getElementById('fecharPopupBtn').addEventListener('click', function() {
            popup.classList.add('hidden');
        });
    }, 10000);
});
