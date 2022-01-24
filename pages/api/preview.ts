import { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse)=>{
    res.setPreviewData({})
    res.redirect(req.query.route as string)
}