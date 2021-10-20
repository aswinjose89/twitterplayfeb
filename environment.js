module.exports = function(appSettingsConfig){
  if(process.env.ENV_ENABLED){
    if(process.env.NODE_ENV == 'dev'){
        appSettingsConfig['appConfig']['node_machine'] = `localhost:${process.env.PORT}`
        appSettingsConfig['appConfig']['protocol'] = process.env.PROTOCOL
        appSettingsConfig['appConfig']['pelias_machine'] = `localhost:${process.env.PELIAS_PORT}`
        appSettingsConfig['appConfig']['rabbit_mq_machine'] = `guest:guest@0.0.0.0:5672`
    }
    else if(process.env.NODE_ENV == 'docker'){
        appSettingsConfig['appConfig']['node_machine'] = `${process.env.NODE_HOST}:${process.env.PORT}`
        appSettingsConfig['appConfig']['protocol'] = process.env.PROTOCOL
        appSettingsConfig['appConfig']['pelias_machine'] = `${process.env.PELIAS_HOST}:${process.env.PELIAS_PORT}`
        appSettingsConfig['appConfig']['rabbit_mq_machine'] = process.env.RABBIT_MQ_CONN_URL
    }
    else{
        appSettingsConfig['appConfig']['node_machine'] = `${process.env.NODE_HOST}:${process.env.PORT}`
        appSettingsConfig['appConfig']['protocol'] = process.env.PROTOCOL
        appSettingsConfig['appConfig']['pelias_machine'] = `${process.env.PELIAS_HOST}:${process.env.PELIAS_PORT}`
        appSettingsConfig['appConfig']['rabbit_mq_machine'] = process.env.RABBIT_MQ_CONN_URL
    }
  }
    return appSettingsConfig
};
