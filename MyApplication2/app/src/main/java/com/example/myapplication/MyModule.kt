package com.example.myapplication

import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteException
import android.util.Log
import com.facebook.react.bridge.*
import com.chaquo.python.Python

class MyModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val ingredientList = mutableListOf<Map<String, Any>>()

    override fun getName(): String {
        return "MyModule"
    }

    @ReactMethod
    fun sendItems(items: ReadableArray, promise: Promise) {
        try {
            // 🔸 1. 사용자 입력 재료 누적
            ingredientList.clear()
            for (i in 0 until items.size()) {
                val map = items.getMap(i)
                if (map != null) {
                    val name = map.getString("name") ?: continue
                    val unit = map.getString("unit") ?: ""
                    val category = map.getString("category") ?: ""
                    val count = map.getInt("count")

                    val itemMap = mutableMapOf<String, Any>(
                        "name" to name,
                        "unit" to unit,
                        "category" to category,
                        "count" to count
                    )

                    ingredientList.add(itemMap)
                    Log.d("MyModule", " 재료 추가됨: name=$name, count=$count, unit=$unit, category=$category")
                }
            }

            val dbPath = reactApplicationContext.getDatabasePath("swRecipe.db").absolutePath
            val dbDataList = mutableListOf<Map<String, Any>>()
            val nameToIdMap = mutableMapOf<String, Int>()

            try {
                val db = SQLiteDatabase.openDatabase(dbPath, null, SQLiteDatabase.OPEN_READONLY)

                val cursorIng = db.rawQuery("SELECT id, name FROM ingredient", null)
                if (cursorIng.moveToFirst()) {
                    do {
                        val id = cursorIng.getInt(cursorIng.getColumnIndexOrThrow("id"))
                        val name = cursorIng.getString(cursorIng.getColumnIndexOrThrow("name"))
                        nameToIdMap[name] = id
                    } while (cursorIng.moveToNext())
                }
                cursorIng.close()

                // 2-2. 레시피별 재료 정보
                val cursor = db.rawQuery("SELECT recipe_id, ingredient_id, priority FROM recipe_ingredients", null)
                if (cursor.moveToFirst()) {
                    do {
                        val recipeId = cursor.getInt(cursor.getColumnIndexOrThrow("recipe_id"))
                        val ingredientId = cursor.getInt(cursor.getColumnIndexOrThrow("ingredient_id"))
                        val priority = cursor.getInt(cursor.getColumnIndexOrThrow("priority"))

                        dbDataList.add(
                            mapOf(
                                "recipe_id" to recipeId,
                                "ingredient_id" to ingredientId,
                                "priority" to priority
                            )
                        )
                    } while (cursor.moveToNext())
                }

                cursor.close()
                db.close()

                Log.d("MyModule", " DB에서 불러온 재료-레시피 수: ${dbDataList.size}")
                Log.d("MyModule", " 재료 ID 매핑 수: ${nameToIdMap.size}")
            } catch (e: SQLiteException) {
                Log.e("MyModule", " DB 읽기 오류", e)
                promise.reject("DB_ERROR", "DB 읽기 실패", e)
                return
            }

            val enrichedList = ingredientList.mapNotNull { item ->
                val name = item["name"] as? String
                val id = nameToIdMap[name]
                if (id != null) {
                    item + mapOf("ingredient_id" to id)
                } else {
                    Log.w("MyModule", "⚠️ 재료명 '$name' → ID 매핑 실패")
                    null
                }
            }

            val py = Python.getInstance()
            val pyModule = py.getModule("test")
            val result = pyModule.callAttr("test", enrichedList, dbDataList)

            Log.d("MyModule", "Python 결과: $result")
            promise.resolve(result.toString())

        } catch (e: Exception) {
            Log.e("MyModule", "전체 처리 실패", e)
            promise.reject("SEND_ITEMS_ERROR", e.message, e)
        }
    }
}
