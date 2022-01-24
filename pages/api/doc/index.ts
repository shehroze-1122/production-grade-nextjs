import nc from 'next-connect'
import { NextApiResponse } from 'next'
import { doc } from '../../../db'
import middleware from '../../../middleware/all'
import onError from '../../../middleware/error'
import { Request } from '../../../types'

const handler = nc<Request, NextApiResponse>({
    onError
})

handler.use(middleware);

handler.post( async (req: Request, res)=>{

    const newDoc = await doc.createDoc(req.db, { createdBy: req.user.id, ...req.body})
    res.send({data: newDoc})

})

export default handler;