
const PRINTER_IP = process.env.EXPO_PUBLIC_PRINTER_IP || '192.168.0.100';
const PRINTER_PORT = parseInt(process.env.EXPO_PUBLIC_PRINTER_PORT || '9100', 10);

const ESC = '\n1B';
const GS = '\x1D';

const commands = {
    INIT: `${ESC}@`,
    BOLD_ON: `${ESC}E\x01`,
    BOLD_OFF: `${ESC}E\x00`,
    ALIGN_LEFT: `${ESC}a\x00`,
    ALIGN_CENTER: `${ESC}a\x01`,
    ALIGN_RIGHT: `${ESC}a\x02`,
    FEED: (lines: number) => `${ESC}d${String.fromCharCode(lines)}`,
    CUT: `${GS}V\x41\x00`,
    LINE_BREAK: '\n',
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
        output += 'CIED - Complexo Hospitalar' + commands.LINE_BREAK;
        output += commands.BOLD_OFF + commands.LINE_BREAK.repeat(2);
        output += commands.ALIGN_LEFT;
        output += `Data: ${new Date().toLocaleDateString()}${commands.LINE_BREAK}`;
        output += `Hora: ${new Date().toLocaleTimeString()}${commands.LINE_BREAK.repeat(2)}`;
        output += commands.ALIGN_CENTER;
        output += commands.BOLD_ON;
        output += `SENHA ${ticket.type}${commands.LINE_BREAK.repeat(2)}`;
        output += `${ticket.number}${commands.LINE_BREAK.repeat(2)}`;
        output += commands.BOLD_OFF;
        output += 'Aguarde seu atendimento' + commands.LINE_BREAK;
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
                socket.write(data, 'binary', () => {
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