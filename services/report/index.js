const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}

async function updateReport(products = []) {
    for (let product of products) {
        if (!product.name) {
            continue
        } else if (!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }
}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} vendas`);
    }
}

async function consume() {
    const rabbit = await RabbitMQService.getInstance();
    console.log("Report Service conectado ao RabbitMQ, aguardando mensagens...");
    await rabbit.consume('report', async (msg) => {
        const saleData = JSON.parse(msg.content);

        // Mostra os dados básicos da venda no console
        console.log("Nova venda recebida no relatório:");
        console.log(`ID: ${saleData.id}`);
        console.log(`Cliente: ${saleData.cliente}`);
        console.log(`Valor: ${saleData.valor}`);
        console.log(`Status: ${saleData.status}`);

        // Atualiza e imprime o relatório apenas se houver produtos
        if (Array.isArray(saleData.products)) {
            await updateReport(saleData.products);
            await printReport();
        } else {
            console.log("Nenhum produto registrado nesta venda.");
        }
        console.log("------");
    }); 
} 

consume()