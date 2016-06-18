/**
 * Created by zubair on 18-Jun-16.
 */
var template = {
    allAssets: function () {
        return 'select SYSID, NAME, CONFIGNAME from TBAsset where PState = 1'
    },
    assetEvents: function (SYSID, startTimestamp, endTimestamp) {
        return `select EVENTTIME, NAME from TBAssetEvent where OIDASSET = ${SYSID} and EVENTTIME between \'${startTimestamp}\' and \'${endTimestamp}\' order by EVENTTIME ASC`
    },
    ignitionEvents: function (SYSID, startTimestamp, endTimestamp) {
        return `select EVENTTIME, NAME from TBAssetEvent where OIDASSET = ${SYSID} and EVENTTIME between \'${startTimestamp}\' and \'${endTimestamp}\' and  NAME like \'%Ignition%\' order by EVENTTIME ASC`
    },
    insertAssetUtilization: function (SYSID, etlDate, usedDuration, used) {
        return `INSERT INTO [dbo].[f.AssetUtilization] ([assetId] ,[usedDuration] ,[used] ,[etlDate]) VALUES (\'${SYSID}\' ,\'${usedDuration}\' ,\'${used}\' ,\'${etlDate}\')`
    },
    updateAssetUtilization: function (SYSID, etlDate, usedDuration, used) {
        return `UPDATE [dbo].[f.AssetUtilization] set usedDuration = \'${usedDuration}\', used = \'${used}\' where assetId =\'${SYSID}\' and etlDate=\'${etlDate}\'`
    },
    checkAssetUtilization: function (SYSID, etlDate) {
        return `select * from [dbo].[f.AssetUtilization] where assetId = \'${SYSID}\' and etlDate = \'${etlDate}\'`
    }
}

module.exports = template;
