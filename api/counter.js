export default async function handler(req, res) {
    try {
        const table  = "Tallies";
        const baseId = process.env.AIRTABLE_BASE_ID;
        const apiKey = process.env.AIRTABLE_API_KEY;

        const response = await fetch(
            `https://api.airtable.com/v0/${baseId}/${table}`,
            {
                headers: { Authorization: `Bearer ${apiKey}` }
            }
        );
        if (!response.ok) { 
            return res.status(response.status).json({ error: "Airtable request failed" }); 
        }

        const data = await response.json();
        const counters = {};
        
        data.records.forEach(record => {
            const type   = record.fields["Type"];
            const number = record.fields["No."]; 
            counters[type] = { number, recordId: record.id };
        });
        res.status(200).json({ counters });
    } 
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: error.message });
    }
}