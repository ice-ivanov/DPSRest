import copy

from rest_framework import serializers
from .models import Order, OrderItem
from django.utils.translation import pgettext_lazy as _
from .bepaid import Bepaid
from django.db.models.signals import post_save
from django.http import HttpResponse
import string

from django.dispatch import receiver


def phone_validator(value):
    print("PHONE", value['phone'], str(value['phone']).isdigit())
    if len(value['phone']) != 9:
        raise serializers.ValidationError(_('Validator|Phone length', 'Phone must be 9 digits long'))
    if str(value['phone']).isdigit() == False:
        raise serializers.ValidationError(_('Validator|Phone length', 'Phone must only contain digits'))


def first_name_validator(value):
    if len(value['first_name']) < 2:
        raise serializers.ValidationError(_('Validator|Name length', 'Min name length 2 letters'))
    if len(value['first_name']) > 25:
        raise serializers.ValidationError(_('Validator|Name length', 'Max name length 25 letters'))


def address_validator(value):
    if len(value['address']) > 60:
        raise serializers.ValidationError(_('Validator|Address Length', 'Max address length 60 letters'))


def comment_validator(value):
    if len(value['comment']) > 60:
        raise serializers.ValidationError(_('Validator|Comment Length', 'Max address length 60 letters'))


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('quantity',
                  'pizza',)


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ('phone',
                  'first_name',
                  'delivery_date',
                  'delivery_time',
                  'address',
                  'comment',
                  'payment',
                  'order_items')
        validators = [phone_validator,
                      first_name_validator,
                      address_validator,
                      comment_validator,
                      ]

    def create(self, validated_data, **kwargs):
        for_items = copy.deepcopy(validated_data)
        bp_total_price = 0

        # create order object
        del validated_data['order_items']
        print('VALID', validated_data)
        order = Order.objects.create(**validated_data)

        # create order items
        for item in for_items.pop('order_items'):
            order_item = dict(item.items())
            bp_total_price += order_item['pizza'].price * order_item['quantity']
            OrderItem.objects.create(order=order, **order_item)

        if validated_data['payment'] == 2:
            bepaid = Bepaid()
            response_data = bepaid.bp_token(bp_total_price)
        else:
            response_data = order

        return response_data
