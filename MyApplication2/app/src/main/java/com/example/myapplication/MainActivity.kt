package com.example.myapplication

import com.facebook.react.ReactActivity

class MainActivity : ReactActivity() {
    override fun getMainComponentName(): String {
        return "MyApplication" // 여기 이름이 JS entry와 연결됨
    }

}

