package com.example.myapplication

import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteException
import android.util.Log
import com.facebook.react.bridge.*
import com.chaquo.python.Python
import org.json.JSONArray

class MyModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val ingredientList = mutableListOf<Map<String, Any>>()

    override fun getName(): String {
        return "MyModule"
    }

    @ReactMethod
    fun sendItems(items: ReadableArray, promise: Promise) {
        try {
            // 1. 사용자 입력 재료 누적
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
                    Log.d("MyModule", "재료 추가됨: name=$name, count=$count, unit=$unit, category=$category")
                }
            }

            // 2. DB 열기 및 데이터 수집
            val dbPath = reactApplicationContext.getDatabasePath("swRecipe2.db").absolutePath
            val dbDataList = mutableListOf<Map<String, Any>>()
            val nameToIdMap = mutableMapOf<String, Int>()
            var db: SQLiteDatabase? = null

            try {
                db = SQLiteDatabase.openDatabase(dbPath, null, SQLiteDatabase.OPEN_READONLY)

                val cursorIng = db.rawQuery("SELECT id, name FROM ingredient", null)
                if (cursorIng.moveToFirst()) {
                    do {
                        val id = cursorIng.getInt(cursorIng.getColumnIndexOrThrow("id"))
                        val name = cursorIng.getString(cursorIng.getColumnIndexOrThrow("name"))
                        nameToIdMap[name] = id
                    } while (cursorIng.moveToNext())
                }
                cursorIng.close()

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

                Log.d("MyModule", "DB에서 데이터 수집 완료")
            } catch (e: SQLiteException) {
                Log.e("MyModule", "DB 읽기 오류", e)
                promise.reject("DB_ERROR", "DB 읽기 실패", e)
                return
            }

            // 3. 사용자 입력 재료에 ID 부여
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

            // 4. Python 호출
            val py = Python.getInstance()
            val pyModule = py.getModule("test")
            val result = pyModule.callAttr("test", enrichedList, dbDataList)

            Log.d("MyModule", "Python 결과: $result")

            // 5. 결과 파싱 및 레시피 구성
            val resultArray = JSONArray(result.toString())
            val outputArray = Arguments.createArray()

            for (i in 0 until resultArray.length()) {
                val item = resultArray.getJSONObject(i)
                val recipeId = item.getInt("recipe_id")
                val similarity = item.getDouble("similarity")

                // 레시피 이름
                val cursorName = db?.rawQuery("SELECT name FROM recipes WHERE id = ?", arrayOf(recipeId.toString()))
                if (cursorName != null && cursorName.moveToFirst()) {
                    val recipeName = cursorName.getString(cursorName.getColumnIndexOrThrow("name"))
                    cursorName.close()

                    // 재료 목록 가져오기
                    val ingCursor = db.rawQuery("SELECT ingredient_id FROM recipe_ingredients WHERE recipe_id = ?", arrayOf(recipeId.toString()))
                    val ingredientNameList = mutableListOf<String>()
                    if (ingCursor.moveToFirst()) {
                        do {
                            val ingId = ingCursor.getInt(ingCursor.getColumnIndexOrThrow("ingredient_id"))
                            val ingNameCursor = db.rawQuery("SELECT name FROM ingredient WHERE id = ?", arrayOf(ingId.toString()))
                            if (ingNameCursor.moveToFirst()) {
                                val ingName = ingNameCursor.getString(ingNameCursor.getColumnIndexOrThrow("name"))
                                ingredientNameList.add(ingName)
                            }
                            ingNameCursor.close()
                        } while (ingCursor.moveToNext())
                    }
                    ingCursor.close()

                    // React Native로 보낼 Map 생성
                    val map = Arguments.createMap()
                    map.putString("name", recipeName)
                    map.putString("description", "유사도 ${(similarity * 100).toInt()}%")

                    val ingArray = Arguments.createArray()
                    for (ing in ingredientNameList) {
                        val ingMap = Arguments.createMap()
                        ingMap.putString("name", ing)
                        ingMap.putInt("amount", 1) // 필요시 수정
                        ingMap.putString("unit", "개") // 필요시 수정
                        ingArray.pushMap(ingMap)
                    }

                    map.putArray("ingredients", ingArray)
                    outputArray.pushMap(map)

                    Log.d("MyModule", "추천 레시피: $recipeName / 재료: $ingredientNameList")
                } else {
                    cursorName?.close()
                }
            }

            db?.close()
            promise.resolve(outputArray)

        } catch (e: Exception) {
            Log.e("MyModule", "전체 처리 실패", e)
            promise.reject("SEND_ITEMS_ERROR", e.message, e)
        }
    }
    @ReactMethod
    fun getRecipeDetail(recipeName: String, promise: Promise) {
        try {
            val dbPath = reactApplicationContext.getDatabasePath("swRecipe2.db").absolutePath
            val db = SQLiteDatabase.openDatabase(dbPath, null, SQLiteDatabase.OPEN_READONLY)

            // 1. 레시피 ID 및 설명 조회
            val recipeCursor = db.rawQuery(
                "SELECT id, recipe FROM recipes WHERE name = ?",
                arrayOf(recipeName)
            )

            if (!recipeCursor.moveToFirst()) {
                promise.reject("NO_RECIPE", "레시피를 찾을 수 없습니다: $recipeName")
                return
            }

            val recipeId = recipeCursor.getInt(recipeCursor.getColumnIndexOrThrow("id"))
            val recipeText = recipeCursor.getString(recipeCursor.getColumnIndexOrThrow("recipe"))

            // 2. 재료 + 카테고리명 조인 조회
            val ingredientCursor = db.rawQuery(
                """
                SELECT i.name, ri.amount, ri.unit, c.name AS category_name
                FROM recipe_ingredients ri
                JOIN ingredient i ON ri.ingredient_id = i.id
                LEFT JOIN category c ON i.category_id = c.id
                WHERE ri.recipe_id = ?
            """.trimIndent(),
                arrayOf(recipeId.toString())
            )

            // 3. 카테고리별로 묶기
            val ingredientMap = mutableMapOf<String, MutableList<Triple<String, String?, String?>>>()

            while (ingredientCursor.moveToNext()) {
                val name = ingredientCursor.getString(0)
                val amount = ingredientCursor.getString(1)
                val unit = ingredientCursor.getString(2)
                val categoryName = ingredientCursor.getString(3) ?: "기타"

                val list = ingredientMap.getOrPut(categoryName) { mutableListOf() }
                list.add(Triple(name, amount, unit))
            }

            // 4. React Native로 보낼 JSON 변환
            val recipeMap = Arguments.createMap()
            recipeMap.putString("recipe_name", recipeName)
            recipeMap.putString("recipe_text", recipeText)

            val ingredientsArray = Arguments.createArray()
            for ((category, items) in ingredientMap) {
                val ingredientGroup = Arguments.createMap()
                ingredientGroup.putString("category", category)

                val nameArray = Arguments.createArray()
                val amountArray = Arguments.createArray()
                val unitArray = Arguments.createArray()

                for ((name, amount, unit) in items) {
                    nameArray.pushString(name)
                    amountArray.pushString(amount ?: "")
                    unitArray.pushString(unit ?: "")
                }

                ingredientGroup.putArray("name", nameArray)
                ingredientGroup.putArray("amount", amountArray)
                ingredientGroup.putArray("unit", unitArray)

                ingredientsArray.pushMap(ingredientGroup)
            }

            recipeMap.putArray("ingredients", ingredientsArray)
            promise.resolve(recipeMap)

            ingredientCursor.close()
            recipeCursor.close()
            db.close()
        } catch (e: Exception) {
            Log.e("MyModule", " getRecipeDetail 오류: ${e.message}")
            promise.reject("DB_ERROR", e.message)
        }
    }



}
