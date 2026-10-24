
class BaseRepository:
    def __init__(self, connection, table, model):
        self.connection = connection
        self.table = table
        self.model = model

    def _to_model(self, row):
        return self.model(**row)

    def find_by_id(self, target_id, column_name_id="id"):
        cursor = self.connection.cursor(dictionary=True)
        try:
            query = f"SELECT * FROM {self.table} WHERE {column_name_id} = %s"
            cursor.execute(query, (target_id,))
            result = cursor.fetchone()
            return self._to_model(result) if result else None
        finally:
            cursor.close()

    def create(self, data_dict):
        columns = ", ".join(data_dict.keys())
        placeholders = ", ".join(["%s"] * len(data_dict))
        values = tuple(data_dict.values())
        query = f"INSERT INTO {self.table} ({columns}) VALUES ({placeholders})"
        cursor = self.connection.cursor()
        try:
            cursor.execute(query, values)
            return cursor.lastrowid
        finally:
            cursor.close()

    def update(self, target_id, data_dict, column_name_id="id"):
        if not data_dict:
            return False

        set_clause = ", ".join([f"{c} = %s" for c in data_dict.keys()])
        values = tuple(data_dict.values()) + (target_id,)
        query = f"UPDATE {self.table} SET {set_clause} WHERE {column_name_id} = %s"
        cursor = self.connection.cursor()
        try:
            cursor.execute(query, values)
            return cursor.rowcount > 0
        finally:
            cursor.close()

    def delete(self, target_id, column_name_id="id"):
        cursor = self.connection.cursor()
        try:
            query = f"DELETE FROM {self.table} WHERE {column_name_id} = %s"
            cursor.execute(query, (target_id,))
            return cursor.rowcount > 0
        finally:
            cursor.close()


