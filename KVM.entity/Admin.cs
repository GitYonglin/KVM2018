using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.entity
{
    public class Admin
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
    }
    public class LoginData
    {
        public string Name { get; set; }
        public string Password { get; set; }
    }
    public class ReturnLoging
    {
        public string Id { get; set; }
        public bool Super { get; set; }
        /// <summary>
        /// 菜单权限
        /// </summary>
        public IEnumerable<string> MenuAuthority { get; set; }
        /// <summary>
        /// 操作权限
        /// </summary>
        public IEnumerable<string> OperatorAuthority { get; set; }
    }
}
