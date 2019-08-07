const PGC = {
    /**
     * 获取 tileset 原始中心位置
     * t 为加载 tileset 成功后进入回调的对象
     */
    getTilesetCenter: function (t) {
        //记录模型原始的中心点
        let boundingSphere = t.boundingSphere;
        //模型原始的中心点。此处是笛卡尔坐标，单位：米。
        let position = boundingSphere.center;
        // 经纬度，单位：弧度
        let catographic = Cesium.Cartographic.fromCartesian(position);
        // 高度，单位：米
        let height = Number(catographic.height);
        // 经纬度，单位：度
        let longitude = Number(Cesium.Math.toDegrees(catographic.longitude).toFixed(6));
        let latitude = Number(Cesium.Math.toDegrees(catographic.latitude).toFixed(6));
        return { x: longitude, y: latitude, z: height };
    }
}
