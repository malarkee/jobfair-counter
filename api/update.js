export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Only POST allowed" });
        }

        const { recordId, delta } = req.body;
        if (!recordId || typeof delta !== "number") {
            return res.status(400).json({ error: "Missing recordId or delta" });
        }
        
        const table  = "Tallies";
        const baseId = process.env.AIRTABLE_BASE_ID;
        const apiKey = process.env.AIRTABLE_API_KEY;

        const getResponse = await fetch(
            `https://api.airtable.com/v0/${baseId}/${table}/${recordId}`,
            { 
                headers: { Authorization: `Bearer ${apiKey}` } 
            }
        );
        if (!getResponse.ok) { 
            return res.status(getResponse.status).json({ error: "Airtable request failed" }); 
        }

        const record   = await getResponse.json();
        const oldValue = record.fields["No."] || 0;
        const newValue = oldValue + delta;

        const patchResponse = await fetch(
            `https://api.airtable.com/v0/${baseId}/${table}/${recordId}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({fields: { "No.": newValue }})
            }
        );
        if (!patchResponse.ok) { 
            return res.status(patchResponse.status).json({ error: "Airtable request failed" }); 
        }

        const updatedRecord = await patchResponse.json();
        res.status(200).json({ counter: updatedRecord.fields["No."]} );
    } 
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: error.message });
    }
}