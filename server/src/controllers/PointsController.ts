import knex from '../database/connection';
import {Request, Response} from 'express';

class PointsController{
    async index (request: Request, response: Response){
        // city, uf , items (Query Params)
        const {city, uf, items} = request.query;

        //trim para tirar os possíveis espaços após a vírgula
        const parsedItems = String(items)
            .split(',')
            .map( item => Number( item.trim() ) );

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');


        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.5.107:3333/uploads/${point.image}`
            }
        })

        return response.json(serializedPoints);
    }

    async show (request: Request, response: Response){
        //const id = request.params.id;
        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if(!point) {
            return response.status(400).json({
                message: 'Point not found.'
            })
        }

        const serializedPoint = {
            ...point, 
            image_url: `http://192.168.5.107:3333/uploads/${point.image}`
        }

        /*
            SELECT * FROM items 
                JOIN point_items ON items.id = point_items.item_id
                WHERE point_items.point_id = {id}
        */
        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        return response.json({serializedPoint, items});
    }

    async create (request: Request, response: Response){
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
    
        //transaction 
        const trx = await knex.transaction();

        const point = {
            image: request.file.filename,
            name:name, // var = prop, omite-se 
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }
    
        // Metodo insert, ao ser executado, retorna os ids dos dados inseridos
        // trx "=" knex
        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0];
    
        const pointItems = items.split(',').map((item: string) => Number(item.trim())).map( (item_id: number) => {
            return {
                item_id,
                point_id
            }
        })
    
        await trx('point_items').insert(pointItems)

        await trx.commit();
    
        return response.json({
            id: point_id,
            ...point, 
        });
    }
}

export default PointsController;