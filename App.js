import Expo from "expo";
import React from "react";
import { StyleSheet, Text, View, Animated, PanResponder } from "react-native";

import * as THREE from "three";
import ExpoTHREE from "expo-three";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pan: new Animated.ValueXY()
    };
  }

  componentWillMount() {
    this._val = { x: 0, y: 0 };
    this.state.pan.addListener(value => (this._val = value));

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: (e, gesture) => {
        this.state.pan.setOffset({
          x: this._val.x,
          y: this._val.y
        });
        this.state.pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: this.state.pan.x, dy: this.state.pan.y }
      ])
    });
  }

  render() {
    const panStyle = {
      transform: this.state.pan.getTranslateTransform()
    };
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Animated.View
          {...this.panResponder.panHandlers}
          style={[panStyle, { width: 200, height: 200 }]}
        >
          <Expo.GLView
            style={{ flex: 1 }}
            onContextCreate={this._onGLContextCreate}
          />
        </Animated.View>
      </View>
    );
  }

  _onGLContextCreate = async gl => {
    const scene = new THREE.Scene();

    const light = new THREE.PointLight( 0xff0000, 1, 100 );
    light.position.set( 50, 50, 50 );		
    scene.add(light)

    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );

    const renderer = ExpoTHREE.createRenderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const geometry = new THREE.SphereBufferGeometry(1, 36, 36);
    const material = new THREE.MeshBasicMaterial({
      color: 0xafeeee,
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require("./img/panorama.png"))
      })
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    
    scene.add(sphere);

    camera.position.z = 2;

    const render = () => {
      requestAnimationFrame(render);

      sphere.rotation.x += 0.01;
      sphere.rotation.y += 0.01;

      renderer.render(scene, camera);

      gl.endFrameEXP();
    };
    render();
  };
}
