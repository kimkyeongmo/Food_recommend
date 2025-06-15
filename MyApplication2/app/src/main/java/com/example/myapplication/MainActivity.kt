package com.example.myapplication

import com.facebook.react.ReactActivity
import android.os.Bundle;

class MainActivity : ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
    }
    override fun getMainComponentName(): String {
        return "MyApplication" // 여기 이름이 JS entry와 연결됨
    }

}

