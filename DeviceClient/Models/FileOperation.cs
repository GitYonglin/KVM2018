using LitJson;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace DeviceClient.Models
{
    public class FileOperation
    {
        /// <summary>
        /// 一个文件保存
        /// </summary>
        /// <param name="file">保存的文件</param>
        /// <param name="fileName">文件名</param>
        /// <param name="path">保存文件路径</param>
        /// <returns></returns>
        public static string FileImg(IFormFile file, string fileName, string rootPath, string path)
        {
            if (!(file is null))
            {
                if (!Directory.Exists(Path.Combine(rootPath, path)))//如果路径不存在
                {
                    Directory.CreateDirectory(Path.Combine(rootPath, path));//创建一个路径的文件夹
                }
                var savePath = Path.Combine(path, $@"{fileName}{Path.GetExtension(file.FileName)}");

                using (var stream = new FileStream(Path.Combine(rootPath, savePath), FileMode.OpenOrCreate))
                {
                    file.CopyTo(stream);
                }
                return savePath;
            }
            return null;
        }
        public static void DeleteFile(string rootPath, string path)
        {
            if (path == null)
            {
                return;
            }
            var savePath = Path.Combine(rootPath, path);
            // Delete a file by using File class static method...
            if (File.Exists(savePath))
            {
                // Use a try block to catch IOExceptions, to
                // handle the case of the file already being
                // opened by another process.
                try
                {
                    File.Delete(savePath);
                }
                catch (IOException)
                {
                }
            }
        }

        public static void DeleteDir(string path)
        {
            if (Directory.Exists(path))//如果路径存在
            {
                DirectoryInfo di = new DirectoryInfo(path);
                di.Delete(true);
            }
        }


        public static void SetDbTxt(string path, string data)
        {
            var db = JsonMapper.ToObject<DbSetting>(File.ReadAllText(path));
            if (db.NowDb == "db.db")
            {
                db.NowDb = "123.db";
            }
            else
            {
                db.NowDb = "db.db";
            }
            data = JsonConvert.SerializeObject(db);
            FileStream fs = new FileStream(path, FileMode.Create);
            //获得字节数组
            byte[] byteData = System.Text.Encoding.Default.GetBytes(data);
            //开始写入
            fs.Write(byteData, 0, data.Length);
            //清空缓冲区、关闭流
            fs.Flush();
            fs.Close();
        }
    }
}
