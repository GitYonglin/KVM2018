using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace KVM.LiteDB
{
    public class Class2Class
    {
        public static T C2C<T>(T old, T upData)
        {
            Type t = old.GetType();
            PropertyInfo[] PropertyList = t.GetProperties();
            foreach (PropertyInfo item in PropertyList)
            {
                var updataValue = item.GetValue(upData, null);
                if (item.Name != "Id" && updataValue != null)
                {
                    item.SetValue(old, updataValue);
                }
            }
            return old;
        }
    }
}
