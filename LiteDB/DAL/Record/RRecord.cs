using System;
using System.Collections.Generic;
using System.Text;
using LiteDB;
using Microsoft.Extensions.Options;

namespace KVM.LiteDB.DAL.Record
{
    public class RRecord : RBase<entity.Record>, IRecord
    {
        private LiteCollection<entity.Record> _col;
        public RRecord(IOptions<DbString> dbString) : base(dbString)
        {
            _col = DbCollection<entity.Record>();
        }

        /// <summary>
        /// 添加一条数据
        /// </summary>
        /// <param name="data">数据</param>
        /// <returns></returns>
        public new ReturnPost Insert(entity.Record data)
        {
            _col.Insert(data);
            return new ReturnPost() { Data = data, Message = true };
        }
        /// <summary>
        /// 修改一条数据
        /// </summary>
        /// <param name="id">Id</param>
        /// <param name="data">数据</param>
        /// <returns></returns>
        public new ReturnPost UpData(string id, entity.Record data)
        {
            var old = _col.FindById(id);
            if (_col.Update(data))
            {
                return new ReturnPost() { Data = data, Message = true };
            }
            return new ReturnPost() { Message = false };
        }
    }
}
