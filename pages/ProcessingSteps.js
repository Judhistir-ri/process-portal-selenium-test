function normalize(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

const rules = [
    {
        service: "legalization",
        documentTypes: ["general (others)", "general"],
        steps: ["SOS", "DOS", "DC EMB"]
    },
    {
        service: "legalization",
        documentTypes: [
            "federal government (others)",
            "federal government"
        ],
        steps: ["DOS", "DC EMB"]
    },
    {
        service: "apostille",
        documentTypes: ["general (others)", "general"],
        steps: ["SOS"]
    },
    {
        service: "apostille",
        documentTypes: [
            "federal government (others)",
            "federal government"
        ],
        steps: ["DOS"]
    }
];

function getProcessingSteps(service, country, documentType) {
    const normalizedService = normalize(service);
    const normalizedDocument = normalize(documentType);

    const rule = rules.find(item =>
        item.service === normalizedService &&
        item.documentTypes.some(
            type => type === normalizedDocument
        )
    );

    if (!rule) {
        throw new Error(
            `No processing-step mapping exists yet for Service="${service}", Country="${country}", Document Type="${documentType}".`
        );
    }

    return [...rule.steps];
}

module.exports = {
    getProcessingSteps
};
