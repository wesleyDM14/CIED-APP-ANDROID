
const PRINTER_IP = process.env.EXPO_PUBLIC_PRINTER_IP || '192.168.0.100';
const PRINTER_PORT = parseInt(process.env.EXPO_PUBLIC_PRINTER_PORT || '9100', 10);

const ESC = '\n1B';
const GS = '\x1D';

const commands = {
    INIT: `${ESC}@`,
    BOLD_ON: `${ESC}E1`,
    BOLD_OFF: `${ESC}E0`,
    ALIGN_LEFT: `${ESC}a0`,
    ALIGN_CENTER: `${ESC}a1`,
    ALIGN_RIGHT: `${ESC}a2`,
    FEED: (lines: number) => `${ESC}d${lines}`,
    CUT: `${GS}V0`,
};

interface PrinterConfig {
    ip?: string;
    port?: number;
}

export interface PrintTicketParams {
    number: string;
    type: 'NORMAL' | 'PREFERENCIAL';
}

export const printTicket = async (ticket: PrintTicketParams, config?: PrinterConfig) => {
    const ip = config?.ip || PRINTER_IP;
    const port = config?.port || PRINTER_PORT;

    try {
        let output = commands.INIT;
        output += commands.ALIGN_CENTER;
        output += commands.BOLD_ON;
        output += '\\nCIED - Complexo Hospitalar\\n';
        output += commands.BOLD_OFF;
        output += '\\n\\n';
        output += commands.ALIGN_LEFT;
        output += `Data: ${new Date().toLocaleDateString()}\\n`;
        output += `Hora: ${new Date().toLocaleTimeString()}\\n\\n`;
        output += commands.ALIGN_CENTER;
        output += commands.BOLD_ON;
        output += `SENHA ${ticket.type}\\n\\n`;
        output += `${ticket.number}\\n\\n`;
        output += commands.BOLD_OFF;
        output += 'Aguarde seu atendimento\\n';
        output += commands.FEED(3);
        output += commands.CUT;

        console.log('Comandos de impressão gerados:', output);

        if (process.env.NODE_ENV === 'production' && ip && port) {
            await sendToPrinter(output, ip, port);
        }

        return true;
    } catch (error) {
        console.error('Erro na impressão:', error);
        throw new Error('Falha na comunicação com a impressora');
    }
};

const sendToPrinter = async (data: string, ip: string, port: number) => {
    return new Promise((resolve, reject) => {
        const socket = require('react-native-tcp-socket').createConnection(
            { port, host: ip },
            () => {
                socket.write(data, 'utf8', () => {
                    socket.destroy();
                    resolve(true);
                });
            }
        );

        socket.on('error', (error: any) => {
            console.error('Erro de conexão:', error);
            socket.destroy();
            reject(error);
        });

        socket.setTimeout(5000, () => {
            console.error('Timeout de conexão');
            socket.destroy();
            reject(new Error('Timeout de conexão'));
        });
    });
};