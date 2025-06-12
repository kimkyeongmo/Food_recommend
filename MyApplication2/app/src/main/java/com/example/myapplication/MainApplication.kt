package com.example.myapplication

import android.app.Application
import android.util.Log
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage
//import com.swmansion.rnscreens.RNScreensPackage 오류 고치기

import com.facebook.soloader.SoLoader
import java.io.FileOutputStream

class MainApplication : Application(), ReactApplication {

    private val mReactNativeHost = object : ReactNativeHost(this) {
        override fun getUseDeveloperSupport(): Boolean = true

        override fun getPackages(): List<ReactPackage> {
            return listOf(
                MainReactPackage(),
                //오류 고치기RNScreensPackage(),
                MyPackage(),  // 네이티브 모듈 패키지
            )
        }

        override fun getJSMainModuleName(): String {
            return "src/main/js/index"
        }
    }

    override fun getReactNativeHost(): ReactNativeHost {
        return mReactNativeHost
    }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)

        // ✅ Chaquopy Python 초기화
        if (!Python.isStarted()) {
            Python.start(AndroidPlatform(this))
            Log.i("MainApplication", "Chaquopy Python 초기화 완료")
        }

        // ✅ SQLite DB 파일 assets → 내부 저장소 복사
        copyDatabaseIfNeeded("swRecipe.db")
    }

    private fun copyDatabaseIfNeeded(dbName: String) {
        val dbPath = getDatabasePath(dbName)
        if (!dbPath.exists()) {
            dbPath.parentFile?.mkdirs()
            try {
                assets.open(dbName).use { input ->
                    FileOutputStream(dbPath).use { output ->
                        input.copyTo(output)
                    }
                }
                Log.i("MainApplication", "$dbName 복사 완료")
            } catch (e: Exception) {
                Log.e("MainApplication", "$dbName 복사 실패", e)
            }
        } else {
            Log.i("MainApplication", "$dbName 이미 존재")
        }
    }
}
