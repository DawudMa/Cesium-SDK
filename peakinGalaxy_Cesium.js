const PGC = {
    /**
     * 获取 tileset 原始中心位置
     * t: 加载 tileset 成功后进入回调的对象
     **/
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
    },
    /**
     * 添加倾斜摄影模型
     * url: tileset.json 路径
     * id: 模型名称
     * ifFly2Model: 是否在加载完成后飞至模型处
     **/
    addModel: function (url, id, ifFly2Model) {
        let t = new Cesium.Cesium3DTileset({
            url: url,
            id: id
        });
        viewer.scene.primitives.add(t);
        t.readyPromise.then((argument) => {
            let c = PGC.getTilesetCenter(argument)
            let longitude = c.x;
            let latitude = c.y;
            let height = c.height;
            let heading = 0;
            let position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
            let mat = Cesium.Transforms.eastNorthUpToFixedFrame(position);
            let rotationX = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(heading)));
            Cesium.Matrix4.multiply(mat, rotationX, mat);
            t._root.transform = mat;
            if (ifFly2Model) {
                setTimeout(() => {
                    viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(longitude, latitude - 0.001, height + 200) });
                }, 1700)
            }
        });
    },
    /**
     * 获取经纬度在屏幕上的位置
     * x: 经度
     * y: 纬度
     **/
    toScreen: function (x, y) {
        let position = Cesium.Cartesian3.fromDegrees(x, y);
        let clickPt = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, position);
        let screenX = clickPt.x;
        let screenY = clickPt.y;
        return { top: screenX, left: screenY }
    },
    /**
     * 获取当前视角高度
     **/
    getHeight: function () {
        let scene = viewer.scene;
        let ellipsoid = scene.globe.ellipsoid;
        let height = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
        return height
    },
    /**
     * 获取当前中心点坐标
     **/
    getCenter: function () {
        // 取椭球面
        let e = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas.clientHeight / 2));
        let curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(e);
        let x = curPosition.longitude * 180 / Math.PI;
        let y = curPosition.latitude * 180 / Math.PI;
        return { x: x, y: y }
    },
    /**
     * 获取点击坐标
     **/
    getClickPos: function () {
        let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        handler.setInputAction(function (click) {
            let clickX = click.position.x;
            let clickY = click.position.y;
            return { x: clickX, y: clickY }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);//响应滚轮点击：MIDDLE_CLICK | 鼠标移动：MOUSE_MOVE
    },
    /**
     * 添加标记
     * x: 经度
     * y: 纬度
     * img: 图片路径
     * height: 图片高度
     * width: 图片宽度
     **/
    addmaker: function (x, y, img, height, width) {
        let p = Cesium.Cartesian3.fromDegrees(x, y);
        viewer.entities.add({
            position: p,
            billboard: {
                image: img, // default: undefined
                show: true, // default
                height: height ? height : 48,
                width: width ? width : 36,
                eyeOffset: new Cesium.Cartesian3(0.0, 5.0, 0.0),
            },
        });
    },
    /*
    * 飞行至指定的经纬度
     * x: 经度
     * y: 纬度
     * pitch 俯仰角（-90~90），默认-90，-90为相机看向正下方，90为相机看向正上方，可选
     * range 相机与目标的距离(单位米)，默认500，可选
     * duration 飞行时间，单位秒，默认飞行3秒，可选
     * */
    fly2Point: function (x, y, pitch, distance, duration) {//点位置 + 俯仰角 + 时间
        let x = x ? x : 0;
        let y = y ? y : 0;
        if (x == 0) {
            return
        }
        let pitch = pitch ? pitch : 45;
        let distance = distance ? distance : 500;
        let duration = duration ? duration : 3;
        let entity = viewer.entities.getById("flyTmp");
        if (Cesium.defined(entity)) {
            viewer.entities.remove(entity);
        }
        entity = viewer.entities.add({
            id: 'flyTmp',
            position: Cesium.Cartesian3.fromDegrees(x, y),
            point: {
                pixelSize: 0,
                color: Cesium.Color.WHITE.withAlpha(0),
                outlineColor: Cesium.Color.WHITE.withAlpha(0),
                outlineWidth: 0
            }
        });
        viewer.flyTo(entity, {
            duration: duration,
            offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(pitch), range)
        });
    },
}
