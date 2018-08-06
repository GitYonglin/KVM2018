using LiteDB;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace KVM.LiteDB
{
    public class DBContext
    {
        private LiteDatabase _DB;

        public DBContext(IOptions<DbString> dbString)
        {
            // 打开数据库 (如果不存在自动创建)
            using (_DB = new LiteDatabase($@"{dbString.Value.ConnectionString}"))
            {
                //// 获取一个集合 (如果不存在创建)
                //var col = db.GetCollection<Customer>("customers");

                //// 创建新顾客实例
                //var customer = new Customer
                //{
                //    Name = "John Doe",
                //    Phones = new string[] { "8000-0000", "9000-0000" },
                //    IsActive = true
                //};

                //// 插入新顾客文档 (Id 自增)
                //col.Insert(customer);

                //// 更新集合中的一个文档
                //customer.Name = "Joana Doe";

                //col.Update(customer);

                //// 使用文档的 Name 属性为文档建立索引
                //col.EnsureIndex(x => x.Name);

                //// 使用 LINQ 查询文档
                //var results = col.Find(x => x.Name.StartsWith("Jo"));

                //// 让我们创建在电话号码字段上创建一个索引 (使用表达式). 它是一个多键值索引
                //col.EnsureIndex(x => x.Phones, "$.Phones[*]");

                //// 现在我们可以查询电话号码
                //var r = col.FindOne(x => x.Phones.Contains("8888-5555"));
            }
        }

        public LiteCollection<T> DbCollection<T>() where T : class
        {
            return _DB.GetCollection<T>(typeof(T).Name);
        }
    }
    public class DbString
    {
        /// <summary>
        /// 数据库连接字符串
        /// </summary>
        public string ConnectionString { get; set; }
    }
}
