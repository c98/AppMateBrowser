const sandboxjs = '\
require("NSJSONSerialization, NSArray, NSString, NSFileManager, NSMutableArray, NSDictionary, NSMutableDictionary, AppServer");\
require("JPEngine").addExtensions(["JPCFunction"]);\
defineCFunction("NSHomeDirectory", "NSString *");\
\
var fileStatsInDirectory = function (directory) {\
	var files = NSFileManager.defaultManager().contentsOfDirectoryAtPath_error(directory, null);\
	var fileStats = NSMutableArray.array();\
	for (var i = 0; i<files.count(); i++) {\
		var file = files.objectAtIndex(i);\
		var filePath = directory.stringByAppendingPathComponent(file);\
		var dic = NSFileManager.defaultManager().attributesOfItemAtPath_error(filePath, null);\
		var dic2 = NSMutableDictionary.dictionary();\
		if (dic.objectForKey("NSFileCreationDate")) {\
			dic2.setObject_forKey(dic.objectForKey("NSFileCreationDate").description(), "NSFileCreationDate");\
		}\
		if (dic.objectForKey("NSFileModificationDate")) {\
			dic2.setObject_forKey(dic.objectForKey("NSFileModificationDate").description(), "NSFileModificationDate");\
		}\
		dic2.setObject_forKey(file, "NSFileName");\
		if (dic.objectForKey("NSFileSize")) {\
			dic2.setObject_forKey(dic.objectForKey("NSFileSize"), "NSFileSize");\
		}\
		if (dic.objectForKey("NSFileType")) {\
			dic2.setObject_forKey(dic.objectForKey("NSFileType"), "NSFileType");\
		}\
		fileStats.addObject(dic2);\
	}\
	return fileStats;\
};\
\
var isDirectory = function (filePath) {\
	return NSFileManager.defaultManager().attributesOfItemAtPath_error(filePath, null)["NSFileType"] === "NSFileTypeDirectory";\
};\
\
var toJSONString = function (obj) {\
	var data = NSJSONSerialization.dataWithJSONObject_options_error(obj, 0, null);\
	var jsonString = NSString.alloc().initWithData_encoding(data, 4);\
	return jsonString;\
};\
\
var home = NSHomeDirectory();\
console.log("home", home);\
var path = home.stringByAppendingPathComponent("{0}");\
var stats = fileStatsInDirectory(path);\
var content = toJSONString(stats);\
AppServer.publishTopic_withMessage_parameters("sandbox", content, {current_dir:"{0}"});\
';

module.exports = {sandboxjs};
