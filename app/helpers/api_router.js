var DataCollectionHandler = require('./data_collection_handler');
module.exports = function(app, isLoggedIn, passport, http, appSettings) {  
    var collectionHandler = new DataCollectionHandler();

    app.get("/topKeywordData", collectionHandler.getTopKeyword);
    app.get("/topHashtagData", collectionHandler.getTopHashtag);

    app.get("/getCustomKeywords", collectionHandler.getCustomKeywords);
    app.get("/getCustomKeywordSessions", collectionHandler.getCustomKeywordSessions);

    app.get("/getInfluentialUsers", collectionHandler.getInfluentialUsers);
    app.get("/getActiveUsers", collectionHandler.getActiveUsers);
}