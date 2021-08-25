// export const API_URL = `http://localhost:${process.env.SERVER_PORT}/api`;
export const getApiUrl = (port) => `http://localhost:${port}/api`;

export const regex = {
    uuid: /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i,
};

export const gerRandom = (array) => array[Math.floor(Math.random() * array.length)];

export function parseJWT(token) {
    try {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('binary'));
    } catch (error) {
        console.error(`ParseJWT: ${error.message}`);
        return null;
    }
}
