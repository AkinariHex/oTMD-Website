import Airtable from "airtable";

export default function handler(req, res) {
    const base = new Airtable({apiKey: process.env.AIRTABLE_APIKEY}).base(process.env.AIRTABLE_BASE)

    if (req.method === 'GET') {
        base('TournamentsRequests').select({
            view: "Grid view"
        }).eachPage(function page(records, fetchNextPage) {

            var mapped = records.map((record) => {return record.fields})
        
            res.status(200).send(mapped)
        
        }, function done(err) {
            if (err) { console.error(err); return; }
        });
      
    }
  }