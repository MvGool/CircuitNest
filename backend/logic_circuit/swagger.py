from drf_yasg.inspectors import SwaggerAutoSchema


class CompoundLevelsSchema(SwaggerAutoSchema):

    def get_tags(self, operation_keys=None):
        return [' > '.join(operation_keys[:-1])]
