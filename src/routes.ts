import { Request, Response, Router } from 'express';
import { Readable } from "stream";
import readline from "readline";

import multer from 'multer';
import { client } from './database/client';

const multerConfig = multer();

const router = Router();

interface Product {
    code_bar: string;
    description: string;
    price: number;
    quantity: number;
}

router.post("/products", multerConfig.single("file"), async (request: Request, response: Response) => {
    const { file } = request;

    const { buffer }: any = file;

    const readableFile = new Readable();
    readableFile.push(buffer);
    readableFile.push(null);

    const productsLine = readline.createInterface({
        input: readableFile
    })

    const products: Product[] = [];

    for await (let line of productsLine) {
        const productsLineSplit = line.split(",");
        
        products.push({
            code_bar: productsLineSplit[0],
            description: productsLineSplit[1],
            price: +productsLineSplit[2],
            quantity: +productsLineSplit[3],
        })
    }

    for await ( let { code_bar, description, price, quantity}  of products) {
        await client.products.create({
            data: {
                code_bar,
                description,
                price,
                quantity,
            },
        });
    }

    return response.json(products);
})

export { router };